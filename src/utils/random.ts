import _ from 'lodash';

export class Random {

    static randomNumericEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
    }

    static randomStringEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum) as unknown as T[keyof T][];
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
    }

    static stringLiteral<T>(str: T): T[keyof T] {
        return str[0];
    }
    static randomFromArray<T>(array: T[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randomIntFromInterval(min: number, max:number) {  
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}