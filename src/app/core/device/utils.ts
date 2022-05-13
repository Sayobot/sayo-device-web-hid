import { BehaviorSubject } from 'rxjs';

export const setItemHandler = <T extends ID>(data$: BehaviorSubject<T[]>, data: T, ok: boolean) => {
  if (ok) {
    console.info('设置成功：', data);

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
