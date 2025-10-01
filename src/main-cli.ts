import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

function onExit() {}

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error', 'log', 'verbose']);
}

bootstrap()
  .then(async (_app) => {
    console.info('command bootstrapped ...!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`server failed to start command`, err);
    process.exit(1);
  })
  .finally(() => {
    return onExit();
  });
