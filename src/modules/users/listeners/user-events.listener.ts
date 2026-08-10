import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PinoLoggerService } from '@/core/logger/logger.service';
import { DOMAIN_EVENTS } from '@/shared/constants/events.constant';

@Injectable()
export class UserEventsListener {
    constructor(private readonly logger: PinoLoggerService) {}

    @OnEvent(DOMAIN_EVENTS.USER_CREATED, { async: true })
    handleUserCreatedEvent(payload: { userId: string; email: string }) {
        this.logger.log(
            `[Event Listener] UserCreated event received for email ${payload.email}. Triggering email notification and wallet setup...`,
            'UserEventsListener',
        );
        // Execute side effects (Send Email, Init Wallet, Audit Log) asynchronously without module coupling!
    }
}
