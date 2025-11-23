// Sui 스마트 컨트랙트 상수
export const PACKAGE_ID = "0xa77e101c6b63b4883b8479c277bc1393d37d118afed2d3cd1e3426ca3b390a5d";
export const PLATFORM_WALLET_ADDRESS = "0xd9c6a152a14be1045cfa2548da7fb2db3d6215d13ed1c172d8b325620d440680";

export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::access_policy::AdminCap`;
export const ACCESS_POLICY_TYPE = `${PACKAGE_ID}::access_policy::AccessPolicy`;
export const VIEW_REQUEST_TYPE = `${PACKAGE_ID}::view_request::ViewRequest`;

// Walrus aggregator URL (testnet)
export const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

// Seal testnet key server object IDs
export const SEAL_KEY_SERVERS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

// Session key TTL (분)
export const SESSION_KEY_TTL_MIN = 10;
