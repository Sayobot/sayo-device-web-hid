import { BehaviorSubject, interval, pipe, Subject, takeUntil } from 'rxjs';

export const setItemHandler = <T extends ID>(data$: BehaviorSubject<T[]>, data: T, ok: boolean) => {
  if (ok) {
    console.info('写入成功：', data);

    let datas = data$.getValue();

    const index = datas.findIndex((item) => item.id === data.id);

    if (index !== -1) {
      datas[index] = data;
    } else {
      console.error('未找到匹配的数据', data, datas);
    }
    data$.next(datas);
  } else {
    console.error('设置失败：', data);
  }
};

export const loopRequestO2Service = (services: O2Service<any>[]) => {
  let done$ = new Subject();
  let count = 0;

  interval(500).pipe(takeUntil(done$)).subscribe(() => {
    if(count < services.length) {
      if(services[count].isSupport()) {
        services[count].init();
      }

      count++;
    } else {
      done$.next(true);
      done$.complete();
    }
  });
}
