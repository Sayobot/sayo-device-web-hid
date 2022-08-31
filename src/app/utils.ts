import * as _ from 'lodash'

enum ASCII {
    Num0 = 48,
    Num9 = 57,
    A = 65,
    Z = 90,
    a = 97,
    z = 122,
    Wave = 126
}

const ASCIIString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const randomAsciiString = (size: number) => {
    let chars = [];

    while (chars.length < size) {
        const code = _.random(0, 127);
        
        const c = String.fromCharCode(code);
        console.log(code, c);
        
        if (ASCIIString.includes(c)) chars.push(c);
    }

    return chars.join('');
};