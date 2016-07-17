import angular from 'angular';
import PatreonRichText from './patreon-rich-text';

export const angularModuleName = 'PatreonRichText';

angular.module(angularModuleName, [])
    .factory('PatreonRichText', PatreonRichText);
