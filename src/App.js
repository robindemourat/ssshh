import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import {csvFormat, csvParse} from 'd3-dsv';
import {v4 as genId} from 'uuid';

import './App.css';
import SoundElement from './SoundElement';
import getAudioAsBase64 from './getAudioAsBase64';
import initDb from './dbManager';

class App extends Component {

  constructor(props) {
    super(props);
    const db = initDb('shhh', this.onDbCallback);
    this.state = {
      elements: [],
      loading: true,
    }

    this.db = db;
  }

  onDbCallback = (type, payload, db) => {
    switch(type) {
      case 'init':
        this.setState({
          elements: payload,
          loading: false
        })
        break;
      default:
        break;
    }
  }

  addElement = element => {
    this.setState({
        elements: [
          ...this.state.elements,
          element,
        ]
    });
    const db = this.db.result;
    // console.log('db is a success', db);

    const tx = db.transaction("ItemsObjectStore", "readwrite");
    const store = tx.objectStore("ItemsObjectStore");
    store.put({...element});
  }

  deleteElement = id => {
    console.log('delete ', id);
    const elements = this.state.elements;
    let element;
    elements.some((el, index) => {
      if (el.id === id) {
        console.log('found');
        element = el;
        delete elements[index];
        return true;
      }
      return false;
    });
    this.setState(elements);
    const db = this.db.result;
    // console.log('db is a success', db);

    const tx = db.transaction("ItemsObjectStore", "readwrite");
    const store = tx.objectStore("ItemsObjectStore");
    store.delete(element.id);
  }

  onDrop = (files) => {
    console.info('on drop', files);
    files.forEach(file => {
      const {
        name,
        preview,
        size,
        type,
        lastModified
      } = file;
      const extension = name.split('.').pop();
      const audioExts = ['mp3', 'wav'];
      if (audioExts.indexOf(extension) > -1) {
        getAudioAsBase64(file, (err, data) => {
          const element = {
            title: name,
            fileName: name,
            src: preview,
            type,
            size,
            lastModified,
            data,
            repeatMode: false,
            randomRepeat: false,
            volume: 100,
            randomSpan: 60,
            displayedRandomSpan: 60,
            id: genId(),
          };
          this.addElement(element);
        });
      } else if (extension === 'csv') {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = (content) => {
          const elements = csvParse(reader.result);
          elements.forEach(element => this.addElement(element))
        }
      }
    })
  }

  setElementProp = (id, key, value) => {
    const elements = this.state.elements;
    elements.some((el, index) => {
      if (el.id === id) {
        const element = {...el, [key]: value};
        elements[index] = element;
        this.setState({elements});

        const db = this.db.result;
        const tx = db.transaction("ItemsObjectStore", "readwrite");
        const store = tx.objectStore("ItemsObjectStore");
        store.put({...element});
        return true;
      }
      return false;
    });
  }

  downloadAll = e => {
    e.stopPropagation();
    e.preventDefault();
    const str = csvFormat(this.state.elements);
    const a = document.createElement('a');
    const blob = new Blob([str], {'type':'text/csv'});
    a.href = window.URL.createObjectURL(blob);
    a.download = 'shhh.csv'
    a.click();
  }

  render() {
    const {
      elements,
      loading,
    } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <h2 className="smoky">
            <span>s</span><span>s</span><span>s</span><span>&nbsp;</span><span>h</span><span>h</span><span>h</span>
          </h2>
          <h3>
            Table de gestion de sons en direct
          </h3>
        </div>
        {!loading && <div className="dropzone-container">
          <h1>1. charge des sons séparés</h1>
          <Dropzone 
            onDrop={this.onDrop} 
          >
            <h3>Fais glisser dans cette zone un fichier audio (mp3 ou wav) ou un fichier csv fait avec cette application</h3>
          </Dropzone>
          {elements.length > 0 && <button onClick={this.downloadAll}>Télécharger le set actuel au format csv (tableau)</button>}
        </div>}
        {!loading && elements.length > 0 && <div className="elements-wrapper">
          <h1>2. compose ta bande son</h1>
          <div className="elements-container">
          {elements.map(element => (
            <SoundElement 
              {...element} 
              setElementProp={this.setElementProp}
              key={element.id} 
              onDelete={this.deleteElement}
            />
          ))}    
          </div>    
        </div>}
        {loading && 
          <div>Chargement ...</div>
        }
      </div>
    );
  }
}

export default App;
