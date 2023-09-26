import { useStore } from "effector-react";
import { $webSocketStatus, sendAction } from "@store/websocket";
import { useCallback, useEffect } from "react";
import { GameAction, MessageType } from "@types";
import {
  $gameManager,
  addSelectedCard,
  clearSelectedCards,
  removeSelectedCard,
  resetGameData,
} from "@store/gameManager";
import { $roomManager } from "@store/roomManager";

export function useGameManager() {
  const { gameData, selectedCardIndexes, activeNotifications } =
    useStore($gameManager);
  const { activeRoom } = useStore($roomManager);
  const websocketStatus = useStore($webSocketStatus);

  const requestCards = useCallback(() => {
    if (activeRoom && activeRoom.code) {
      const action: GameAction = {
        type: MessageType.REQUEST,
        payload: {
          room_code: activeRoom.code,
        },
      };
      sendAction(action);
    }
  }, [activeRoom]);

  const addCardToSelection = useCallback((cardIndex: number) => {
    addSelectedCard(cardIndex);
  }, []);

  const removeCardFromSelection = useCallback((cardIndex: number) => {
    removeSelectedCard(cardIndex);
  }, []);

  const makeMove = useCallback(() => {
    if (activeRoom && activeRoom.code) {
      const action: GameAction = {
        type: MessageType.MOVE,
        payload: {
          cards: selectedCardIndexes.map((i) => gameData.in_play[i]),
          room_code: activeRoom?.code,
        },
      };
      sendAction(action);
      clearSelectedCards();
    }
  }, [selectedCardIndexes, gameData.in_play, activeRoom]);

  useEffect(() => {
    if (selectedCardIndexes.length === 3 && gameData.in_play) {
      makeMove();
    }
  }, [selectedCardIndexes, gameData.in_play, activeRoom]);

  return {
    gameData,
    addCardToSelection,
    removeCardFromSelection,
    selectedCardIndexes,
    requestCards,
    makeMove,
    activeNotifications,
    resetGameData,
    websocketStatus,
  };
}
