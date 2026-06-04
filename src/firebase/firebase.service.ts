import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FirebaseService.name);

  public firestore!: admin.firestore.Firestore;
  public auth!: admin.auth.Auth;

  constructor(private readonly config: ConfigService) {}

  onApplicationBootstrap() {
    if (admin.apps.length > 0) {
      this.firestore = admin.firestore();
      this.auth = admin.auth();
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.config
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
        }),
      });

      this.firestore = admin.firestore();
      this.auth = admin.auth();
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error initializing Firebase: ${err.message}`);
    }
  }
}
