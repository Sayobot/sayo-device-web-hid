import { catchError, filter, fromEvent, interval, of, Subject, switchMap, takeUntil, tap, timeout } from 'rxjs';
import { Cmd, Config, Method, Offset } from './const';

/**
 * 发送请求
 * @param device
 * @param reportData
 * @returns
 */
export const sendReport = (device: HIDDevice, reportData: Uint8Array) => {
  if (!device) throw new Error("could not connect device.");
  if (!device.opened) throw new Error("could not open device.");

  return device.sendReport(Config.reportId, reportData);
};

/**
 * 计算检验和
 * @param data
 * @param checkBit
 * @returns
 */
export const calcChecksum = (data: number[]) => {
  return (data.reduce((sum, n) => sum + n) + Config.checkSumStepSize) % 256;
};

/**
 * 获取 read 请求的 buffer 数据
 * @param cmd
 * @param id
 * @returns
 */
export const makeReadBuffer = (cmd: Cmd, id: number) => {
  const checkOffset = Config.cmdSize + Config.checkSumStepSize;

  let reportData = new Array(checkOffset).fill(0);
  reportData[Offset.Cmd] = cmd;
  reportData[Offset.Size] = Config.cmdSize;
  reportData[Offset.Method] = Method.Read;
  reportData[Offset.Id] = id;
  reportData[checkOffset] = calcChecksum(reportData.slice(0, checkOffset));

  return new Uint8Array(reportData);
};

/**
 * 读取多个
 * 存在顺序关系，且数量位置，因此不能 combineLatest 等操作符
 * @param device 设备
 * @param cmd cmd
 * @param parser 解析函数
 * @param handler 处理函数
 */
export const loopRequestByRead = <T extends ID>(
  device: HIDDevice,
  option: ReadListOption<T>
) => {
  const lock = option.lock;
  let id = 0;
  let result: T[] = [];

  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(
    takeUntil(done$),
    timeout(100),
    catchError((e) => {
      console.error(e.message);
      done$.next(true);
      done$.complete();
      return of();
    }),
  );

  input$.subscribe((report: HIDInputReportEvent) => {
    lock.unlock();

    if (report.data !== undefined) {
      const buffer = new Uint8Array(report.data.buffer);

      if (option.HIDLog) {
        console.log("HID Read Response:", option.key, buffer);
      }

      const target = option.parser(buffer);
      if (buffer[0] !== 0xff && buffer[0] !== 0x03) {
        result.push(target);
      } else {

        if (option.log) {
          console.log("Read Response: ", option.key, result);
        }

        done$.next(true);
        done$.complete();
      }
    }
  });

  interval(1).pipe(
    takeUntil(done$),
    filter(() => !lock.isLock()),
    switchMap((_) => {
      lock.lock();
      const buffer = makeReadBuffer(option.cmd, id);
      id++;
      if (option.HIDLog) {
        console.log("HID Read Request:", option.key, buffer);
      }

      return sendReport(device, buffer);
    }),
  ).subscribe();

  done$.subscribe((done) => {
    if (done) option.handler(result);
  });
};

/**
 * 读取单个
 * @param device 设备
 * @param reportData 请求
 * @param parser 解析器
 * @param handler 请求结束后处理函数
 */
export const requestByRead = <T>(
  device: HIDDevice,
  option: ReadItemOption<T>
) => {
  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));

  input$.subscribe(({ data }) => {
    const buffer = new Uint8Array(data.buffer);

    if (option.HIDLog) {
      console.log("HID Read Response:", option.key, buffer);
    }

    const result = option.parser(buffer);

    if (option.log) {
      console.log("Read Response:", option.key, result);
    }

    option.handler(result);

    done$.next(true);
    done$.complete();
  });

  if (option.HIDLog) {
    console.log("HID Read Request:", option.key, option.buffer);
  }

  sendReport(device, option.buffer);
};

/**
 * 写入设备
 * @param device
 * @param reportData
 * @param handler
 */
export const requestByWrite = (
  device: HIDDevice,
  option: WriteItemOption
) => {

  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));

  input$.subscribe(({ data }) => {
    const ok = data.getInt8(0) === 0;

    if (option.HIDLog) {
      ok ?
        console.log("HID Write Response: ", option.key, "succesful") :
        console.error("HID Write Response: ", option.key, "failure");
    }

    option.handler(ok);
    done$.next(true);
    done$.complete();
  });

  if (option.HIDLog) {
    console.log("HID Write Request:", option.key, option.buffer);
  }

  sendReport(device, option.buffer);
};

export default {
  calcCheckSum: calcChecksum,
  loopRequestByRead,
  requestByRead,
  requestByWrite,
  makeReadBuffer,
  sendReport
}
