import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class PushNotificationService {
  private expo: Expo;
  private readonly logger = new Logger(PushNotificationService.name);

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Gửi thông báo đẩy đến các thiết bị chỉ định
   */
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data: any = {},
  ): Promise<ExpoPushTicket[]> {
    // Lọc ra các token hợp lệ
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      this.logger.warn('No valid Expo push tokens found');
      return [];
    }

    // Tạo messages từ các token
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    // Chia messages thành chunks để tránh quá giới hạn của Expo
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    // Gửi từng chunk
    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error('Error sending push notifications', error);
      }
    }

    return tickets;
  }

  /**
   * Kiểm tra receipts để biết trạng thái của các thông báo đã gửi
   */
  async checkPushNotificationReceipts(receiptIds: string[]) {
    const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

        // Xử lý kết quả
        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];
          
          if (receipt.status === 'ok') {
            continue;
          } else if (receipt.status === 'error') {
            this.logger.error(
              `There was an error sending a notification: ${receipt.status}`,
              receipt.details,
            );
          }
        }
      } catch (error) {
        this.logger.error('Error checking receipts', error);
      }
    }
  }
} 