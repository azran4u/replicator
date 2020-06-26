export function duration(hrstart: [number, number]): number {
    const hrend = process.hrtime(hrstart);
    const duration = hrend[0]*1000 + hrend[1] / 1000000;
    return duration;
}
