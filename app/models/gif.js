import classic from 'ember-classic-decorator';
import Model, { attr } from '@ember-data/model';

@classic
export default class Gif extends Model {
  @attr()
  slug;

  @attr()
  url;

  @attr()
  previewUrl;
}
