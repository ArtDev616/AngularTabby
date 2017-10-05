import {Component, Input, OnInit} from '@angular/core';
import {Note} from '../shared/note';
import {PlayerService} from '../shared/player.service';
import {Tuning} from "../shared/tabmusic";
import {Instrument} from "../shared/tabsounds";

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
        background-image: url('assets/img/note-bkg.png');
        background-repeat: no-repeat;
      }

      span.played.onedigit::before {
        margin: 0 -17px 0 -16px;
        background-position-x: 8px;
        padding: 4px 6px 6px 6px;
      }

      span.played.twodigits::before {
        margin: 0 -18px 0 -15px;
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
        border-width: 5px;
        border-style: solid;
        border-color: black transparent transparent transparent;
      }

      .tooltip:hover .tooltiptext {
        visibility: visible;
      }
      
    `]
    ,
    template: `<span [ngClass]="setClasses()" (click)="playNote($event)">{{note.text}}<span class="tooltiptext">{{label}}</span></span>`
  }
)
export class TabbyNoteComponent implements OnInit {

  @Input() note: Note;

  label = '';

  currentNoteIndex = -1;
  currentTuning: Tuning = null;
  currentInstrument: Instrument = null;

  constructor(private playerService: PlayerService) {
  }

  ngOnInit() {
    this.playerService.music.noteIndex$.subscribe((noteIndex) => {
      this.currentNoteIndex = noteIndex;
    });

    this.playerService.music.tuning$.subscribe((tuning) => {
      this.currentTuning = tuning;
      this.updateLabel();
    });

    this.playerService.music.instrument$.subscribe((instrument) => {
      this.currentInstrument = instrument;
      this.updateLabel();
    });
  }

  private updateLabel() {
    if (this.currentInstrument && this.currentTuning && this.note && this.note.stringIndex >= 0 && this.note.fretValue !== undefined ) {
      this.label = this.currentInstrument.getNote(this.currentTuning, this.note.stringIndex, this.note.fretValue);
    }
  }

  playNote(event: any) {
    this.currentInstrument.playSound(this.currentTuning, this.note.stringIndex, this.note.fretValue);
  }

  setClasses() {
    const classes = {
      'tooltip': this.note.fretValue >= 0,
      'note': this.note.fretValue >= 0,
      'played': this.note.fretValue >= 0 && this.note.index <= this.currentNoteIndex,
      'onedigit': this.note.digits === 1,
      'twodigit': this.note.digits === 2
    };
    return classes;
  }

}

