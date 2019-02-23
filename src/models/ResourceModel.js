import _ from 'lodash';

export class ResourceModel {
  static structure = {
    description  : '',
    dateposted   : '',
    title        : '',
    link         : '',
    indexid      : -1,
    photouri     : '',
    photofilename: '',
  };

  constructor(data = ResourceModel.structure){
    this.data = {...ResourceModel.structure, ...data};
  };

  get title(){
    return this.data.title || '';
  };

  get link(){
    return this.data.link || '';
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
