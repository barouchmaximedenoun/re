import { TokenManager } from "@clients/http";
import { WebTokenStorage } from "./web-token-storage";

export class WebTokenManager extends TokenManager {
  public constructor() {
      super(new WebTokenStorage());   
  }
}
