import { BehaviorSubject } from 'rxjs';

export const setItemHandler = <T extends ID>(data$: BehaviorSubject<T[]>, data: T, ok: boolean) => {
  if (ok) {
    console.info('设置成功：', data);

    let keys = data$.getValue();

    const index = keys.findIndex((item) => item.id === data.id);

    if (index !== -1) {
      keys[index] = data;
    } else {
      console.error('未找到匹配的数据', data);
    }
    data$.next(keys);
  } else {
    console.error('设置失败：', data);
  }
};
