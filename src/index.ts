import { logger } from './logger';
import { dbDal } from './database';
import { perf } from './performance';
import { s3Instance } from './s3';
import { cli } from './command';
import { geo } from './geo';
import { bbox1, bbox2 } from './data';

async function start() {

    logger.info(`starting`);
    const command = cli();

    if (command.deleteAll) {
        await dbDal.deleteAllShapes();
        logger.info(`deleted all rows in db`);
    }

    if (command.rowsToAddBbox1 > 0) {
        const points = geo.generateRandomPoints(command.rowsToAddBbox1, bbox1);
        await dbDal.insertShapes(points);
        logger.info(`added = ${command.rowsToAddBbox1} rows.`);
    }

    if (command.rowsToAddBbox2 > 0) {
        const points = geo.generateRandomPoints(command.rowsToAddBbox2, bbox2);
        await dbDal.insertShapes(points);
        logger.info(`added = ${command.rowsToAddBbox2} rows.`);
    }

    if (command.printNumberOfRows) {
        const count = await dbDal.getAllShapesCount();
        logger.info(`number of rows in db = ${count}`);
    };

    if (command.searchBbox1) {
        const count = (await dbDal.getAllShapesContainedInBbox(bbox1)).length;
        logger.info(`number of rows in bbox1 = ${count}`);
    };

    if (command.searchBbox2) {
        const count = (await dbDal.getAllShapesContainedInBbox(bbox2)).length;
        logger.info(`number of rows in bbox2 = ${count}`);
    };

    if (command.deleteBbox1) {
        const count = await dbDal.deleteAllShapesContainedInBbox(bbox1);
        logger.info(`deleted ${count} rows from bbox1`);
    };

    if (command.deleteBbox2) {
        const count = await dbDal.deleteAllShapesContainedInBbox(bbox2);
        logger.info(`deleted ${count} rows from bbox2`);
    };

    if (command.sendLog) {
        const filename = `perf.csv`;
        await perf.export(filename);
        await s3Instance.upload(filename);
        await s3Instance.upload(`logs.log`);
        logger.info(`send log succesfully`);
    };

    if (command.fileToUploadToS3 != '') {
        await s3Instance.upload(command.fileToUploadToS3);
    };

    process.exit();
}

start();