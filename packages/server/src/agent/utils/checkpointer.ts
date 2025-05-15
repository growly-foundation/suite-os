import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ConfigService } from '@nestjs/config';

export const createCheckpointer = async (configService: ConfigService) => {
  const checkpointer = PostgresSaver.fromConnString(
    configService.get('POSTGRES_CONNECTION_STRING') || ''
  );

  if (!checkpointer) {
    throw new Error('Failed to create checkpointer');
  }

  await checkpointer.setup();

  return checkpointer;
};

export const getCheckpointer = async (configService: ConfigService) => {
  const checkpointer = await createCheckpointer(configService);
  return checkpointer;
};
