declare module '@mtproto/core' {
  export class MTProto {
    constructor(config: {
      api_id: number;
      api_hash: string;
      storageOptions?: {
        path: string;
      };
    });

    call(method: string, params: any): Promise<any>;
    setDefaultDc?(dcId: number): Promise<void>;
    crypto: {
      getSRPParams(params: {
        g: number;
        p: Buffer;
        salt1: Buffer;
        salt2: Buffer;
        gB: Buffer;
        password: string;
      }): Promise<{
        srp_id: string;
        A: Buffer;
        M1: Buffer;
      }>;
    };
  }
}
