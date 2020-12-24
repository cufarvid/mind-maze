import { IScoreData, IScores } from '../types';

export default class ScoreManager {
  private static scores: IScores = {};

  public static get getScores(): IScores {
    return this.scores;
  }

  public static levelScores(level: number): Array<IScoreData> {
    return this.scores[level];
  }

  public static modeScores(level: number, mode: number): IScoreData {
    return this.scores[level][mode];
  }

  public static reset(): void {
    this.scores = {};
  }

  public static addScore(level: number, data: IScoreData): void {
    if (!ScoreManager.scores[level]) ScoreManager.scores[level] = [];

    ScoreManager.scores[level].push(data);
  }
}
