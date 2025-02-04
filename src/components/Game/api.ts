import urlJoin from 'proper-url-join';
import { request } from '../../api/client';

export const getGame = async (lobbyID: string): Promise<{
  currentPlayer: string
  pack: {
    name: string
    rounds: {
      name: string
      themes: {
        name: string
        questions: {
          points: number
          text: string
        }[]
      }[]
    }[]
  }
  players: {
    profile: {
      id: string
      username: string
    }
    score: number
  }[]
  round: number
}> => request(urlJoin('/lobby', lobbyID, 'game'));
