import { IFormattedReaction, IReactions } from '@reaction/interfaces/reaction.interface';
import _ from 'lodash';

export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.substr(1).toLowerCase()}`)
      .join(' ');
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static avatarColor(): string {
    const colors: string[] = [
      '#f44336',
      '#e91e63',
      '#2196f3',
      '#9c27b0',
      '#3f51b5',
      '#00bcd4',
      '#4caf50',
      '#ff9800',
      '#8bc34a',
      '#009688',
      '#03a9f4',
      '#cddc39',
      '#2962ff',
      '#448aff',
      '#84ffff',
      '#00e676',
      '#43a047',
      '#d32f2f',
      '#ff1744',
      '#ad1457',
      '#6a1b9a',
      '#1a237e',
      '#1de9b6',
      '#d84315'
    ];
    return colors[_.floor(_.random(0.9) * colors.length)];
  }

  static parseJson(prop: string): unknown {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }

    return JSON.parse(prop);
  }

  static formattedReactions(reactions: IReactions): IFormattedReaction[] {
    const postReactions: IFormattedReaction[] = [];
    for (const [key, value] of Object.entries(reactions)) {
      if (value > 0) {
        const reactionObject: IFormattedReaction = {
          type: key,
          value
        };
        postReactions.push(reactionObject);
      }
    }
    return postReactions;
  }

  static escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  static shuffle(list: string[]): string[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static isDataURL(value: string): boolean {
    const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
  }
}
