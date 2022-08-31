import { catchError, fromEvent, interval, of, Subject, switchMap, takeUntil, timeout } from 'rxjs';
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

  // console.info("发送报告：", reportData);

  return device.sendReport(Config.reportId, reportData);
};

/**
 * 计算检验和
 * @param data
 * @param checkBit
 * @returns
 */
export const calcChecksum = (data: number[], checkBit: number) => {
  return (data.slice(0, checkBit).reduce((sum, n) => sum + n) + Config.checkSumStepSize) % 256;
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
  reportData[checkOffset] = calcChecksum(reportData, checkOffset);

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
  cmd: Cmd,
  parser: (data: Uint8Array) => T,
  handler: (data: T[]) => void,
) => {
  let result: T[] = [];

  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(
    takeUntil(done$),
    timeout(100),
    catchError((_) => {
      done$.next(true);
      done$.complete();
      return of();
    }),
  );

  input$.subscribe((report: HIDInputReportEvent) => {
    if (report.data !== undefined) {
      const buffer = new Uint8Array(report.data.buffer);
      // console.info("接受报告: ", buffer);

      const target = parser(buffer);
      if (result.findIndex((item) => item.id === target.id) === -1) {
        result.push(target);
      } else {
        console.info("读取列表数据: ", result);

        done$.next(true);
        done$.complete();
      }
    }
  });

  const request$ = interval(Config.period).pipe(
    takeUntil(done$),
    switchMap((id) => sendReport(device, makeReadBuffer(cmd, id))),
  );

  request$.subscribe();

  done$.subscribe((done) => {
    if (done) handler(result);
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
  reportData: Uint8Array,
  parser: (data: Uint8Array) => T,
  handler: (data: T) => void,
) => {
  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));

  input$.subscribe(({ data }) => {
    const buffer = new Uint8Array(data.buffer);
    // console.info("接受报告: ", buffer);

    const result = parser(buffer);
    handler(result);

    console.info("读取数据: ", result);

    done$.next(true);
    done$.complete();
  });

  sendReport(device, reportData);
};

/**
 *
 * @param device
 * @param reportData
 * @param handler
 */
export const requestByWrite = (device: HIDDevice, reportData: Uint8Array, handler: (ok: boolean) => void) => {
  const done$ = new Subject<boolean>();
  const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));

  input$.subscribe(({ data }) => {
    handler(data.getInt8(0) === 0);
    done$.next(true);
    done$.complete();
  });

  sendReport(device, reportData);
};
