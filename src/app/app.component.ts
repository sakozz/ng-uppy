import { Component, OnInit } from '@angular/core';
import { IUppy, UppyFile } from 'uppy-store-ngrx';
import * as Uppy from 'uppy/lib/core';
import * as RestoreFiles from 'uppy/lib/plugins/GoldenRetriever';
import * as Dashboard from 'uppy/lib/plugins/Dashboard';
import * as GoogleDrive from 'uppy/lib/plugins/GoogleDrive';
import * as Dropbox from 'uppy/lib/plugins/Dropbox';
import * as Instagram from 'uppy/lib/plugins/Instagram';
import * as Webcam from 'uppy/lib/plugins/Webcam';
import * as Tus from 'uppy/lib/plugins/Tus';

@Component({
  selector    : 'app-root',
  templateUrl : './app.component.html',
  styleUrls   : [ './app.component.css' ]
})
export class AppComponent implements OnInit {
  private uppy: IUppy<any, UppyFile<any>>;

  ngOnInit () {
    this.uppy = new Uppy({
      debug        : true,
      autoProceed  : false,
      restrictions : {
        allowedFileTypes : [ 'image/*', 'video/*' ]
      }
    })
      .use(Dashboard, {
        trigger              : '.UppyModalOpenerBtn',
        inline               : true,
        target               : '.DashboardContainer',
        replaceTargetContent : true,
        note                 : 'Images and video only, 2–3 files, up to 1 MB',
        maxHeight            : 450,
        metaFields           : [
          { id : 'license', name : 'License', placeholder : 'specify license' },
          {
            id          : 'caption',
            name        : 'Caption',
            placeholder : 'describe what the image is about'
          }
        ]
      })
      .use(GoogleDrive, { target : Dashboard, host : 'https://server.uppy.io' })
      .use(Dropbox, { target : Dashboard, host : 'https://server.uppy.io' })
      .use(Instagram, { target : Dashboard, host : 'https://server.uppy.io' })
      .use(Webcam, { target : Dashboard })
      .use(Tus, { endpoint : 'http://217.64.47.142/files/', resume : true })
      .use(RestoreFiles, {
        serviceWorker : true,
        indexedDB     : {
          maxFileSize  : 2 * 1024 * 1024 * 1024, // 2GB => Each file
          maxTotalSize : 1024 * 1024 * 1024 * 1024 // 1 TB
        }
      })
      .run();

    this.uppy.on('complete', result => {
      console.log('successful files:', result.successful);
      console.log('failed files:', result.failed);
    });

    const isServiceWorkerControllerReady = new Promise(function (resolve) {
      if (navigator.serviceWorker.controller) {
        return resolve();
      }
      navigator.serviceWorker.addEventListener('controllerchange', function (e) {
        return resolve();
      });
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.bundle.js')
        .then(function (registration) {
          return isServiceWorkerControllerReady;
        })
        .then(function () {
          // uppy.emit('core:file-sw-ready');
        }).catch(function (error) {
        console.log('Registration failed with ' + error)
      });
    }
  }
}
