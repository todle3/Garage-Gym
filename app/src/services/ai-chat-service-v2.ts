import { AiChatResponseV2 } from '@/models/ai-models';
import { TolgeeInstance, TranslationKey } from '@tolgee/react';

/**
 * Stand-in AI planner, in place while planning moves onto the user's own API key.
 *
 * LiftLog's planner ran on the server: this class opened a SignalR connection to the `/ai-chat-v2` hub,
 * authenticated with a RevenueCat purchase token, and the backend held the provider key and owned the
 * prompt. Garage Gym inverts that - the key belongs to the user and the app calls Anthropic or OpenAI
 * directly - so the hub is unreachable (there is no purchase to authenticate with) and its transport is
 * gone rather than left half-connected.
 *
 * Until the on-device client lands, the chat acknowledges what was asked and says plainly that it can't
 * act on it yet. The interface is unchanged, so the planner screen and its effects need no edit when the
 * real implementation replaces this.
 */
export class AiChatServiceV2 {
  constructor(private tolgee: TolgeeInstance) {}

  async *introduce(): AsyncIterableIterator<AiChatResponseV2> {
    yield {
      type: 'messageResponse',
      message: this.tolgee.t('ai.planning_unavailable.introduction' satisfies TranslationKey),
    };
  }

  async *sendMessage(message: string): AsyncIterableIterator<AiChatResponseV2> {
    yield {
      type: 'messageResponse',
      message: this.tolgee.t('ai.planning_unavailable.acknowledgement' satisfies TranslationKey, {
        request: message,
      }),
    };
  }

  /** Nothing is in flight to stop, and there is no server-side conversation to reset. */
  async stopInProgress() {}

  async restartChat() {}
}
