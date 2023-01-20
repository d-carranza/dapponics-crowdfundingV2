# Lesson 7

### Start this hardhat project from scratch

```
yarn add --dev hardhat
yarn hardhat
```

Select Typescript project, then copy/paste in the terminal the suggested dependencies (\*not all are used and you can be more specific in the future)

### Add manually dotenv, solhint,

```
yarn add --dev dotenv
yarn add --dev solhint
```

create a .env file and initialize solhint using

```
yarn solhint --init
```

Add chainlink

```
yarn add --dev @chainlink/contracts
```

Add hardhat-deploy to make our life easier when deploying and testing

```
yarn add --dev hardhat-deploy
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers
```

Hora 11:00:00
Joder, amazing stuff so far.
Acabo de crear un codigo robusto para hacer deploy multichain de un mismo contrato sin cambiar nada. Incluyendo oracles. Super cremas y util
