import React from 'react';

import CityList from '../../../data/airports.json';
import {fromInput} from '../../../utils/state';

class AutocompleteFrom extends React.Component {

  state = {
    value: "",
    locs: [],
    limit: 1,
    focuse: false,
    options: [],
    optionLimit: 8,
    active: -1
  }

  // update by localStorage
  componentDidMount(){
    this.setState({locs: fromInput.value});
  }

  // update by url query
  componentDidUpdate(){
    if(this.state.locs.length > 0 && JSON.stringify(fromInput.value) !== JSON.stringify(this.state.locs)){
      this.setState({locs: fromInput.value});
    }
  }

  // searching options from airport list
  findOptions(value){
    function check_substring(given_str, checking_str){
      var splitted = given_str.split(" ");
      var return_check_substring = true;
      for(var i=0; i<splitted.length; i++){
        if(!(checking_str.toUpperCase().includes(splitted[i].toUpperCase()))) return_check_substring = false;
      }
      return return_check_substring;
    }

    if(value.length > 0){
      let list = [];
      for(let i=0; i<CityList.length; i++){
        if(check_substring(value, CityList[i].loc)){
          list.push(CityList[i]);
          if(list.length >= this.state.optionLimit) i=CityList.length;
        }
      }
      this.setState({options: list, value: value, active: -1});
    }else this.setState({options: [], value: ""});
  }

  // create option
  showOptions(){
    let options = [];
    for(let i=0; i<this.state.options.length; i++){
      if(i === this.state.active) options.push(<div key={i} className="autocomplete-active" onClick={this.choose.bind(null, i)}>{this.state.options[i].loc}</div>);
      else options.push(<div key={i} onClick={this.choose.bind(null, i)}>{this.state.options[i].loc}</div>);
    }
    if(this.state.focuse && options.length > 0) return(<div className="autocomplete-items">{options}</div>);
    else return(<></>);
  }

  // create tags
  showTags(){
    let tags = [];
    for(let i=0; i<this.state.locs.length; i++) tags.push(
      <div key={i} className="tag">
        <span>{this.state.locs[i].loc.split(',')[0]}</span>
        <div className="close" onClick={this.close.bind(null, this.state.locs[i].id)}>+</div>
      </div>
    );
    return tags;
  }

  // choosing option function
  choose = (optionId) => {
    let check = true;
    this.state.locs.forEach( i => {
      if(this.state.options.length <= optionId || i.id === this.state.options[optionId].id) check = false;
    });
    if(check){
      this.state.locs.push(this.state.options[optionId]);
      fromInput.value = this.state.locs;
      localStorage.setItem("Origin", JSON.stringify(this.state.locs));
      this.setState({locs: this.state.locs, value: "", options: []});
    }else this.setState({value: "", options: []});
  }

  // closing tag function
  close = (id) => {
    let list = [];
    this.state.locs.forEach( i => {
      if(i.id !== id) list.push(i);
    });
    this.setState({locs: list});
  }

  // detecting actions
  keyDown(keyCode){
    if(keyCode === 40){
      this.setState({active: ((this.state.active+1)%this.state.options.length)});
    }else if(keyCode === 38){
      if(this.state.active > 0){
        this.setState({active: this.state.active-1});
      }else{
        this.setState({active: this.state.options.length-1});
      }
    }else if(keyCode === 13 && this.state.active >= 0){
      this.choose(this.state.active);
    }else if(keyCode === 8 && this.state.locs.length > 0 && this.state.value.length === 0){
      this.close(this.state.locs[this.state.locs.length-1].id);
    }
  }

  // creating input value string
  getInputValue(){
    let value = "";
    this.state.locs.forEach( i => value += `${i.id}+`);
    return value;
  }

  render(){
    return(
      <div className="from">
        <h4>from</h4>
        <div className="autocomplete">
          <div className="from-tag">

            {this.showTags()}

						<input
              data-testid="inputText"
              className="input-text"
              type="text"
              value={this.state.value}
              placeholder={(this.state.locs.length > 0) ? "" : "From where? (city, country)"}
              onChange={(e) => (this.state.locs.length >= this.state.limit) ? "" : this.findOptions(e.target.value)}
              onKeyDown={(e) => this.keyDown(e.keyCode)}
              onFocus={() => this.setState({focuse: true})}
              onBlur={() => setTimeout(() => this.setState({focuse: false}), 250)}
            />

            <input type="hidden" id="Origin" name="Origin" value={this.getInputValue()}/>

            {this.showOptions()}

					</div>
        </div>
      </div>
    );
  }

}

export default AutocompleteFrom;
