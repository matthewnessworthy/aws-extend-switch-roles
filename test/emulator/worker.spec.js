import { testInWorker } from './fixtures.js';

testInWorker('externalConfigReceived tests', async () => {
  for (const test of [
    self.__tests__.externalConfigReceivedTest,
    self.__tests__.externalConfigReceivedFailureTest,
  ]) {
    await test();
    await self.__tests__.clean();
  }
})

testInWorker('findProfilesTable tests', async () => {
  await self.__tests__.findTargetProfilesTest();
})

testInWorker('findProfilesTable from lztext fallback tests', async () => {
  await self.__tests__.findTargetProfilesFromLztextTest();
})

testInWorker('updateProfilesTable tests', async () => {
  for (const test of [
    self.__tests__.updateProfilesTableMigrateSyncTest,
    self.__tests__.updateProfilesTableMigrateLocalTest,
    self.__tests__.updateProfilesTableUpdateSyncTest,
    self.__tests__.updateProfilesTableNoUpdateTest,
  ]) {
    await test();
    await self.__tests__.clean();
  }
})
