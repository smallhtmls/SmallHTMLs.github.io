export const STATE_READ = 0x1;
export const STATE_WRITE = 0x0;

const BIT_MODE_8 = 2n ** 8n - 1n;
const BIT_MODE_16 = 2n ** 16n - 1n;
const BIT_MODE_32 = 2n ** 32n - 1n;
const BIT_MODE_64 = 2n ** 64n - 1n;
export const BIT_MODE = {
    8: BIT_MODE_8,
    16: BIT_MODE_16,
    32: BIT_MODE_32,
    64: BIT_MODE_64,
};
