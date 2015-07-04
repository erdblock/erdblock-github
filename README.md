# erdblock-github

## Description
Links your GitHub account statics (Repos count, Followers, Gists, Popular Repos)


## Config
| Name           | Description  | Values |
| -------------- | ------------- | ----- |
| `username`       | Github Username | `janniklorenz`
| `reposCount`     | The number of repos to show, ordered by stars | `3` |


## Example
````javascript
var github = require("erdblock-github")()
github.locals.config.username.setValue("janniklorenz")
github.locals.config.reposCount.setValue("3")
erdblock.addPlugin(github)
````
