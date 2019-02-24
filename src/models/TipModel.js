import _ from 'lodash';

export class TipModel {
  static structure = {
    tip          : '',
    title        : '',
    indexid      : -1,
    tipnumber    : -1,
    dateposted   : '',
    photouri     : '',
    photofilename: '',
  };

  constructor(data = TipModel.structure){
    this.data = {...TipModel.structure, ...data};
  };

  get title(){
    return this.data.title || '';
  };

  get tip(){
    return this.data.tip || '';
  };

  get tipnumber(){
    return this.data.tipnumber || '';
  };

  get dateposted(){
    return this.data.dateposted || '';
  };

  get description(){
    return this.data.description || '';
  };

  get photouri(){
    return this.data.photouri;
  };

  get photofilename(){
    return this.data.photofilename;
  };

  get(){
    return this.data;
  };
};
