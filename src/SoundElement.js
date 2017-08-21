import React, { Component } from 'react';
// import ReactAudioPlayer from 'react-audio-player';
import AudioPlayer from 'react-h5-audio-player';
import Slider from 'react-slider'

export default class SoundElement extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canPlay: false,
      isPlaying: false,

      repeatMode: false,
      randomRepeat: false,
      volume: 100,
      randomSpan: 60,
      displayedRandomSpan: 60,
      title: props.title || 'sans titre'
    }
    this.timeOut = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.volume / 100 !== this.el.audio.volume) {
      this.el.audio.volume = nextProps.volume / 100;
    }
  }

  onCanPlay = () => {
    this.setState({canPlay: true})
  }

  onPlay = () => {
    this.setState({isPlaying: true})
  }

  onPause = () => {
    this.setState({isPlaying: false});
    if (this.state.repeatMode && this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
  }

  toggleRepeatMode = () => {
    if (this.state.repeatMode && this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    this.props.setElementProp(this.props.id, 'repeatMode', !this.props.repeatMode)
  }

  toggleRandomRepeatMode = () => {
    this.props.setElementProp(this.props.id, 'randomRepeat', !this.props.randomRepeat)
  }

  onEnded = () => {
    if (this.state.randomRepeat) {
      const waitFor = Math.random() * 1000 * this.state.randomSpan;
      console.info(this.state.title, ' wait for ', waitFor / 1000, ' sec')
      this.timeOut = setTimeout(() => {
        console.info(this.state.title, ' replaying after timeout')
        this.el.audio.play();
        this.setState({isPlaying: true});
      }, waitFor)
    } else if (this.state.repeatMode) {
      this.el.audio.play();
      this.setState({isPlaying: true});
    }
  }

  onRandomSpanChange = (e) => {
    const displayedRandomSpan = e.target.value;
    let randomSpan = this.state.randomSpan;
    let toChange;
    if (!isNaN(+displayedRandomSpan)) {
      randomSpan = +displayedRandomSpan;
      toChange = true;
    }
    this.props.setElementProp(this.props.id, 'displayedRandomSpan', displayedRandomSpan);
    this.props.setElementProp(this.props.id, 'randomSpan', randomSpan);
    setTimeout(() => {
      if (toChange && !this.state.isPlaying) {
        clearTimeout(this.timeOut);
        this.timeOut = null;
        this.onEnded();
      }
    })
  }

  onVolumeChange = to => {
    console.info(this.props.title, 'changes volume to', to);
    // this.el.audio.volume = to / 100;
    this.props.setElementProp(this.props.id, 'volume', to);
  }

  onTitleChange = e => {
    const title = e.target.value;
    const id = this.props.id;
    this.props.setElementProp(id, 'title', title);
  }

  render() {
    const {
      // src,
      // title,
      data,
      id,

      onDelete,

      repeatMode,
      volume,
      randomRepeat,
      // randomSpan,
      displayedRandomSpan,
      title: activeTitle
    } = this.props;
    const {
      // canPlay,
      isPlaying,

    } = this.state;
    const bindEl = el => {
      this.el = el;
    }
    const onDeleteClick = () => {
      onDelete(id);
    }
    return (
      <div 
        className="sound-element"
        style={{
          background: isPlaying ? repeatMode ? '#a03e20' : '#b0d85b': repeatMode ? '#D4613E' : '#b9c8cc'
        }}
      >
        <div className="title">
          <h2>
            <input type="text" value={activeTitle} onChange={this.onTitleChange} /><button onClick={onDeleteClick}>Supprimer</button>
          </h2>
        </div>
        <div className="settings">
          <button onClick={this.toggleRepeatMode}>{repeatMode ? 'stopper répétition' : 'activer répétition'}</button>
          {repeatMode && <div className="repeat-details">
            <span>{randomRepeat ? 'répétion aléatoire': 'répétition en continu'}</span>
            <button onClick={this.toggleRandomRepeatMode}>{randomRepeat ? 'répéter en continu' : 'répéter aléatoirement'}</button>
            {randomRepeat && <p>Répétition aléatoire dans un intervalle de <input type="text" value={displayedRandomSpan} onChange={this.onRandomSpanChange} /> secondes</p>}
          </div>}
        </div>
        <div 
          className="player-wrapper"
        >
          <AudioPlayer
            src={data}
            ref={bindEl}
            onEnded={this.onEnded}
            onCanPlay={this.onCanPlay}
            onPlay={this.onPlay}
            onPause={this.onPause}
          /> 
        </div>
        <Slider 
          defaultValue={[0, 100]} 
          value={volume}
          onChange={this.onVolumeChange}
          withBars
        />
      </div>
    )
  }
}