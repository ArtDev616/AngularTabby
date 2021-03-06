import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {PlayerService} from '../shared/player.service';
import {Instrument, Tuning} from '../shared/tabsounds';
import {TabNote} from '../shared/tabparser';


@Component(
  {
    selector: 'app-tabby-note',

    styles: [`
      span.note {
      }

      span.note.tooltip:hover {
        color: blue;
      }

      span.played {
      }

      span.played::before {
        content: '   ';
        z-index: -1;
        background: url('assets/img/note-bkg.png') no-repeat;
      }

      span.played.bad::before {
        background-image: url('assets/img/note-bkg-gray.png');
      }

      span.played.onedigit::before {
        margin: 0 -17px 0 -16.5px; /* perfect for chrome */
        background-position-x: 8px;
        padding: 4px 6px 6px 6px;
      }

      /*This will work for firefox */
      span.played.onedigit.firefox::before {
        margin: 0 -17px 0 -18px;
      }

      /*This will work for IE */
      span.played.onedigit.ie::before {
        margin: 0 -17px 0 -21px;
      }

      /*This will work for Chrome on iPad */
      span.played.onedigit.chrome_ios::before {
        margin: 0 -17px 0 -18.4px;
      }

      /*This will work for Chrome on android phone */
      span.played.onedigit.chrome_android::before {
        margin: 0 -17px 0 -18.4px;
      }

      /*This will work for Safari on iPad */
      span.played.onedigit.safari_ipad::before {
        margin: 0 -17px 0 -18.4px;
      }

      span.played.twodigit::before {
        margin: 0 -18px 0 -15.5px;
        background-position-x: 11px;
        padding: 4px 6px 6px 6px;
      }

      /* Tooltip container */
      .tooltip {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }

      .tooltip:hover {
      }

      .tooltip .tooltiptext {
        visibility: hidden;
        width: 30px;
        background-color: darkblue;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;
        position: absolute;
        z-index: 1;
        bottom: 150%;
        left: 50%;
        margin-left: -15px;
      }

      .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border: 5px solid transparent;
        border-top-color: black;
      }

      .tooltip:hover .tooltiptext {
        visibility: visible;
      }
    `]
    ,
    template: `<span [ngClass]="setClasses()" (click)="playNote($event)">{{note.text}}<span class="tooltiptext">{{noteName}}</span></span>`,
    changeDetection: ChangeDetectionStrategy.OnPush
  }
)
export class TabbyNoteComponent implements OnInit {

  @Input() note: TabNote;

  noteName = '';
  badNote = false;

  currentNoteIndex = -1;
  currentTuning: Tuning = null;
  currentInstrument: Instrument = null;

  constructor(private cd: ChangeDetectorRef, private playerService: PlayerService) {
  }

  ngOnInit() {

    this.playerService.music.isPlaying$.subscribe((v) => {
      this.currentNoteIndex = -1;
      this.cd.markForCheck();
    });

    this.playerService.music.note$.subscribe((n) => {

      if ( n ) {
        this.currentNoteIndex = n.index;
        if (n.index === this.note.index ) {
          this.cd.markForCheck();
        }
      } else {
        this.currentNoteIndex = -1;
        this.cd.markForCheck();
      }
    });

    this.playerService.music.song$.subscribe((s) => { this.cd.markForCheck(); } );

    this.playerService.music.tuning$.subscribe((tuning) => {
      this.currentTuning = tuning;
      this.updateLabel();
      this.cd.markForCheck();
    });

    this.playerService.music.instrument$.subscribe((instrument) => {
      this.currentInstrument = instrument;
      this.updateLabel();
      this.cd.markForCheck();
    });
  }

  private updateLabel() {
    if (this.currentInstrument && this.currentTuning && this.note && this.note.stringIndex >= 0 && this.note.fretValue !== undefined) {
      this.noteName = this.currentInstrument.getMusicalNotes().getNoteName(this.currentTuning, this.note.stringIndex, this.note.fretValue);
      this.badNote = this.currentInstrument.getMusicalNotes().getNote(this.noteName) === undefined;
    }
  }

  playNote(event: any) {
    this.currentInstrument.playSound(this.noteName, 1);
  }

  setClasses() {
    return {
      'tooltip': this.note.fretValue >= 0,
      'note': this.note.fretValue >= 0,
      'played': this.note.fretValue >= 0 && this.note.index <= this.currentNoteIndex,
      'bad': this.badNote,
      'onedigit': this.note.digits === 1,
      'twodigit': this.note.digits === 2,

      'firefox': navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
      'ie': !!navigator.userAgent.match(/Trident\/7\./),
      'chrome_ios': navigator.userAgent.indexOf('CriOS') > -1,
      'chrome_android': navigator.userAgent.indexOf('Android') > -1 && navigator.userAgent.indexOf('Chrome') > -1,
      'safari_ipad': navigator.userAgent.indexOf('iPad') > -1 && navigator.userAgent.indexOf('Safari') > -1
      && navigator.userAgent.indexOf('CriOS') === -1
    };
  }

}

