import { IScoreData, IScores } from '../types';

export default class ScoreManager {
  private static scores: IScores = {};

  public static get getScores(): IScores {
    return this.scores;
  }

  public static addScore(level: number, data: IScoreData): void {
    if (!ScoreManager.scores[level]) ScoreManager.scores[level] = [];

    ScoreManager.scores[level].push(data);
  }
}
