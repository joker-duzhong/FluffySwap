
export type AssetToken = {
  token: string;
  region: RegionEnum;
  bucket: string;
  domain: string;
};

export enum RegionEnum {
  z0 = "z0",
  z1 = "z1",
  z2 = "z2",
  na0 = "na0",
  as0 = "as0",
  cnEast2 = "cn-east-2",
}

export interface AssetInfo {
  id: string;
  name: string;
  format: string;
  size: number;
  creator: string; // 根据用户token自动写入
  created: number;
  status: AssetStatus; //  默认值  AssetStatus.Default
  url: string;
  owner?: any;
  thumbnail?: string; // 缩略图， 图像特有
  remark?: string;
  prompt?: string;
}

export enum AssetStatus {
  Default = 0,
  Wicked = 1,
  Public = 2,
}

class AssetService extends BaseServices {
  private uriPrefix: string = "asset/";
  private static _ins: AssetService = new AssetService();
  public static get ins(): AssetService {
    return this._ins ? this._ins : (this._ins = new AssetService());
  }

  /** 获取上传所需配置 */
  public getConfig(): Promise<void> {
    const url = "https://back.zaiwenai.com/api/v1/asset/config";
    const data = {};
    return new Promise((resolve) => {
      return this.request<AssetToken>(url, data, "GET")
        .then((res) => {
          localStorage.setItem("assetToken", JSON.stringify(res.data));
          resolve();
        })
        .catch(() => {
          resolve();
        });
    });
  }
  /** 保存七牛云文件到数据库  */
  public add(name: string, format: string, size: number, owner: string, url_id: string, thumbnail?: string, remark?: string): Promise<AssetInfo> {
    const url = config.versionV1 + this.uriPrefix + Method.Add;
    const data = { name, format, size, owner, url: url_id, thumbnail, remark };
    return new Promise((resolve, reject) => {
      return this.request<AssetInfo>(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export const assetService: AssetService = AssetService.ins;
