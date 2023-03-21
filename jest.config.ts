import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  modulePaths: ["src"],
  moduleNameMapper: pathsToModuleNameMapper({
    "config/*": ["config/*"],
    "controllers/*": ["controllers/*"],
    "middleware/*": ["middleware/*"],
    "models/*": ["models/*"],
    "schemas/*": ["schemas/*"],
    "services/*": ["services/*"],
    "utils/*": ["utils/*"],
  }),
};

export default jestConfig;
