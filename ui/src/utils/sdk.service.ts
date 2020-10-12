import * as PhotoPaySDK from "../../../es/photopay-sdk";

import {
  AvailableRecognizers,
  AvailableRecognizerOptions,
  CameraExperience,
  Code,
  EventFatalError,
  EventReady,
  VideoRecognitionConfiguration,
  ImageRecognitionConfiguration,
  RecognizerInstance,
  RecognitionEvent,
  RecognitionStatus,
  RecognitionResults,
  SdkSettings
} from './data-structures';

export interface CheckConclusion {
  status: boolean;
  message?: string;
}

export class SdkService {
  private sdk: PhotoPaySDK.WasmSDK;

  private eventEmitter$: HTMLAnchorElement;

  private cancelInitiatedFromOutside: boolean = false;

  public showOverlay: boolean = false;

  constructor() {
    this.eventEmitter$ = document.createElement('a');
  }

  public initialize(licenseKey: string, sdkSettings: SdkSettings): Promise<EventReady|EventFatalError> {
    const loadSettings = new PhotoPaySDK.WasmSDKLoadSettings(licenseKey);

    loadSettings.allowHelloMessage = sdkSettings.allowHelloMessage;
    loadSettings.engineLocation = sdkSettings.engineLocation;

    return new Promise((resolve) => {
      PhotoPaySDK.loadWasmModule(loadSettings)
        .then((sdk: PhotoPaySDK.WasmSDK) => {
          this.sdk = sdk;
          this.showOverlay = sdk.showOverlay;
          resolve(new EventReady(this.sdk));
        })
        .catch(error => {
          resolve(new EventFatalError(Code.SdkLoadFailed, 'Failed to load SDK!', error));
        });
    });
  }

  public checkRecognizers(recognizers: Array<string>): CheckConclusion {
    if (!recognizers || !recognizers.length) {
      return {
        status: false,
        message: 'There are no provided recognizers!'
      }
    }

    for (const recognizer of recognizers) {
      if (!this.isRecognizerAvailable(recognizer)) {
        return {
          status: false,
          message: `Recognizer "${ recognizer }" doesn't exist!`
        }
      }

    }

    return {
      status: true
    }
  }

  public checkRecognizerOptions(recognizers: Array<string>, recognizerOptions: Array<string>): CheckConclusion {
    if (!recognizerOptions || !recognizerOptions.length) {
      return {
        status: true
      }
    }

    for (const recognizerOption of recognizerOptions) {
      let optionExistInProvidedRecognizers = false;

      for (const recognizer of recognizers) {
        const availableOptions = AvailableRecognizerOptions[recognizer];

        if (availableOptions.indexOf(recognizerOption) > -1) {
          optionExistInProvidedRecognizers = true;
          break;
        }
      }

      if (!optionExistInProvidedRecognizers) {
        return {
          status: false,
          message: `Recognizer option "${ recognizerOption }" is not supported by available recognizers!`
        }
      }
    }

    return {
      status: true
    }
  }

  public getDesiredCameraExperience(recognizers: Array<string>): CameraExperience {
    for (let i = 0; i < recognizers.length; ++i) {}
    return CameraExperience.Barcode;
  }

  public async scanFromCamera(
    configuration: VideoRecognitionConfiguration,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<void> {
    eventCallback({ status: RecognitionStatus.Preparing });

    const recognizers = await this.createRecognizers(
      configuration.recognizers,
      configuration.recognizerOptions,
      configuration.successFrame
    );

    const recognizerRunner = await this.createRecognizerRunner(
      recognizers,
      eventCallback
    );

    try {
      const videoRecognizer = await PhotoPaySDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
        configuration.cameraFeed,
        recognizerRunner
      );

      await videoRecognizer.setVideoRecognitionMode(PhotoPaySDK.VideoRecognitionMode.Recognition);

      this.eventEmitter$.addEventListener('terminate', async () => {
        if (videoRecognizer && typeof videoRecognizer.cancelRecognition === 'function') {
          videoRecognizer.cancelRecognition();
        }

        if (recognizerRunner) {
            try {
              await recognizerRunner.delete();
            } catch (error) {
              // Psst, this error should not happen.
            }
        }

        for (const recognizer of recognizers) {
          if (!recognizer) {
            continue;
          }

          if (
            recognizer.recognizer &&
            recognizer.recognizer.objectHandle > -1 &&
            typeof recognizer.recognizer.delete === 'function'
          ) {
            recognizer.recognizer.delete()
          }

          if (
            recognizer.successFrame &&
            recognizer.successFrame.objectHandle > -1
            && typeof recognizer.successFrame.delete === 'function'
          ) {
            recognizer.successFrame.delete();
          }
        }

        window.setTimeout(() => {
          if (videoRecognizer) {
            videoRecognizer.releaseVideoFeed();
          }
        }, 1);
      });

      videoRecognizer.startRecognition(
        async (recognitionState: PhotoPaySDK.RecognizerResultState) => {
          videoRecognizer.pauseRecognition();

          eventCallback({ status: RecognitionStatus.Processing });

          if (recognitionState !== PhotoPaySDK.RecognizerResultState.Empty) {
            for (const recognizer of recognizers) {
              const results = await recognizer.recognizer.getResult();

              if (!results || results.state === PhotoPaySDK.RecognizerResultState.Empty) {
                eventCallback({
                  status: RecognitionStatus.EmptyResultState,
                  data: { initiatedByUser: this.cancelInitiatedFromOutside }
                });
              } else {
                const recognitionResults: RecognitionResults = { recognizer: results }

                if (recognizer.successFrame) {
                  const successFrameResults = await recognizer.successFrame.getResult();

                  if (successFrameResults && successFrameResults.state !== PhotoPaySDK.RecognizerResultState.Empty) {
                    recognitionResults.successFrame = successFrameResults;
                  }
                }

                eventCallback({
                  status: RecognitionStatus.ScanSuccessful,
                  data: recognitionResults
                });
                break;
              }
            }
          } else {
            eventCallback({
              status: RecognitionStatus.EmptyResultState,
              data: { initiatedByUser: this.cancelInitiatedFromOutside }
            });
          }

          window.setTimeout(() => void this.cancelRecognition(), 400);
        }
      );
    } catch (error) {
      if (error && error.name === 'VideoRecognizerError') {
        const reason = (error as PhotoPaySDK.VideoRecognizerError).reason;

        switch (reason) {
          case PhotoPaySDK.NotSupportedReason.MediaDevicesNotSupported:
            eventCallback({ status: RecognitionStatus.NoSupportForMediaDevices });
            break;

          case PhotoPaySDK.NotSupportedReason.CameraNotFound:
            eventCallback({ status: RecognitionStatus.CameraNotFound });
            break;

          case PhotoPaySDK.NotSupportedReason.CameraNotAllowed:
            eventCallback({ status: RecognitionStatus.CameraNotAllowed });
            break;

          case PhotoPaySDK.NotSupportedReason.CameraInUse:
            eventCallback({ status: RecognitionStatus.CameraInUse });
            break;

          default:
            eventCallback({ status: RecognitionStatus.UnableToAccessCamera });
        }

        console.warn('VideoRecognizerError', error.name, '[' + reason + ']:', error.message);
        void this.cancelRecognition();
      } else {
        eventCallback({ status: RecognitionStatus.UnknownError });
      }
    }
  }

  public isScanFromImageAvailable(recognizers: Array<string>): boolean {
    for (let i = 0; i < recognizers.length; ++i) {}
    return true;
  }

  public async scanFromImage(
    configuration: ImageRecognitionConfiguration,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<void> {
    eventCallback({ status: RecognitionStatus.Preparing });

    const recognizers = await this.createRecognizers(
      configuration.recognizers,
      configuration.recognizerOptions
    );

    const recognizerRunner = await this.createRecognizerRunner(
      recognizers,
      eventCallback
    );

    // Get image file
    const imageRegex = RegExp(/^image\//);
    const file: File|null = (() => {
      for (let i = 0; i < configuration.fileList.length; ++i) {
        if (imageRegex.exec(configuration.fileList[i].type)) {
          return configuration.fileList[i];
        }
      }

      return null;
    })();

    if (!file) {
      eventCallback({ status: RecognitionStatus.NoImageFileFound });
      return;
    }

    const imageElement = document.createElement('img');
    imageElement.src = URL.createObjectURL(file);
    await imageElement.decode();
    const imageFrame = PhotoPaySDK.captureFrame(imageElement);

    this.eventEmitter$.addEventListener('terminate', async () => {
      if (recognizerRunner) {
          try {
            await recognizerRunner.delete();
          } catch (error) {
            // Psst, this error should not happen.
          }
      }

      for (const recognizer of recognizers) {
        if (!recognizer) {
          continue;
        }

        if (
          recognizer.recognizer &&
          recognizer.recognizer.objectHandle > -1 &&
          typeof recognizer.recognizer.delete === 'function'
        ) {
          await recognizer.recognizer.delete();
        }
      }
    });

    // Get results
    eventCallback({ status: RecognitionStatus.Processing });

    const processResult = await recognizerRunner.processImage(imageFrame);

    if (processResult !== PhotoPaySDK.RecognizerResultState.Empty) {
      for (const recognizer of recognizers) {
        const results = await recognizer.recognizer.getResult();

        if (!results || results.state === PhotoPaySDK.RecognizerResultState.Empty) {
          eventCallback({
            status: RecognitionStatus.EmptyResultState,
            data: { initiatedByUser: this.cancelInitiatedFromOutside }
          });
        } else {
          const recognitionResults: RecognitionResults = { recognizer: results }
          eventCallback({
            status: RecognitionStatus.ScanSuccessful,
            data: recognitionResults
          });
          break;
        }
      }
    } else {
      eventCallback({
        status: RecognitionStatus.EmptyResultState,
        data: { initiatedByUser: this.cancelInitiatedFromOutside }
      });
    }

    window.setTimeout(() => void this.cancelRecognition(), 500);
  }

  public async stopRecognition() {
    void await this.cancelRecognition(true);
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // PRIVATE METHODS

  private isRecognizerAvailable(recognizer: string): boolean {
    return !!AvailableRecognizers[recognizer];
  }

  private async createRecognizers(
    recognizers: Array<string>,
    recognizerOptions?: Array<string>,
    successFrame: boolean = false
  ): Promise<Array<RecognizerInstance>> {
    const pureRecognizers = [];

    for (const recognizer of recognizers) {
      const instance = await PhotoPaySDK[AvailableRecognizers[recognizer]](this.sdk);
      pureRecognizers.push(instance);
    }

    if (recognizerOptions && recognizerOptions.length) {
      for (const recognizer of pureRecognizers) {
        let settingsUpdated = false;
        const settings = await recognizer.currentSettings();

        for (const setting of recognizerOptions) {
          if (setting in settings) {
            settings[setting] = true;
            settingsUpdated = true;
          }
        }

        if (settingsUpdated) {
          await recognizer.updateSettings(settings);
        }
      }
    }

    const recognizerInstances = [];

    for (const recognizer of pureRecognizers) {
      const instance: RecognizerInstance = { recognizer }

      if (successFrame) {
        const successFrameGrabber = await PhotoPaySDK.createSuccessFrameGrabberRecognizer(this.sdk, recognizer);
        instance.successFrame = successFrameGrabber;
      }

      recognizerInstances.push(instance)
    }

    return recognizerInstances;
  }

  private async createRecognizerRunner(
    recognizers: Array<RecognizerInstance>,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<PhotoPaySDK.RecognizerRunner> {
    const metadataCallbacks: PhotoPaySDK.MetadataCallbacks = {
      onDetectionFailed: () => eventCallback({ status: RecognitionStatus.DetectionFailed }),
      onQuadDetection: (quad: PhotoPaySDK.Displayable) => {
        eventCallback({ status: RecognitionStatus.DetectionStatusChange, data: quad });

        const detectionStatus = quad.detectionStatus;

        switch (detectionStatus) {
          case PhotoPaySDK.DetectionStatus.Fail:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case PhotoPaySDK.DetectionStatus.Success:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case PhotoPaySDK.DetectionStatus.CameraTooHigh:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooHigh });
            break;

          case PhotoPaySDK.DetectionStatus.FallbackSuccess:
            eventCallback({ status: RecognitionStatus.DetectionStatusFallbackSuccess });
            break;

          case PhotoPaySDK.DetectionStatus.Partial:
            eventCallback({ status: RecognitionStatus.DetectionStatusPartial });
            break;

          case PhotoPaySDK.DetectionStatus.CameraAtAngle:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraAtAngle });
            break;

          case PhotoPaySDK.DetectionStatus.CameraTooNear:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooNear });
            break;

          case PhotoPaySDK.DetectionStatus.DocumentTooCloseToEdge:
            eventCallback({ status: RecognitionStatus.DetectionStatusDocumentTooCloseToEdge });
            break;

          default:
            // Send nothing
        }
      }
    }


    const recognizerRunner = await PhotoPaySDK.createRecognizerRunner(
      this.sdk,
      recognizers.map((el: RecognizerInstance) => el.successFrame || el.recognizer),
      false,
      metadataCallbacks
    );

    return recognizerRunner;
  }

  private async cancelRecognition(initiatedFromOutside: boolean = false): Promise<void> {
    this.cancelInitiatedFromOutside = initiatedFromOutside;
    this.eventEmitter$.dispatchEvent(new Event('terminate'));
  }
}

