import { Injectable } from '@angular/core';
import { NativeAudio } from '@ionic-native/native-audio';

@Injectable()
export class AudioService {

    constructor(protected nativeAudio: NativeAudio) {
    }

    init() {
        this.nativeAudio.preloadSimple('tear', 'assets/audio/tear.mp3')
            .then(() => {
            }, err => {
                console.log(err);
            });
    }

    play(name: string) {
        this.nativeAudio.play(name);
    }

}
