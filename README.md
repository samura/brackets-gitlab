# Brackets Gitlab

Integrate Brackets with gitlab.

## Objectives

* Always have the issue you're working on accessible from brackets.
* Ability to close a Gitlab issue by commiting all the modified files (works with extension Brackets-Git).
* Ability to reference an issue on submit.


## Installation

### Requirements

For this extension to work as expected, you'll need **Brackets-Git**.
Follow the [instructions](https://github.com/zaggino/brackets-git/).


**Brackets-Gitlab** is not yet on the extension registry.
You'll need to install it manually.


### Installation from URL

The plugin is not yet on the extension registry.
You'll need to install it manually.

1. Open the the Extension Manager from the File menu.
2. Click on Install form URL...
3. Copy and paste following URL in the text field: https://github.com/mikaeljorhult/brackets-php-code-quality-tools
4. Click Install
5. Open a terminal on the `extensions/user/samura.brackets-gitlab/node/`
6. Run `npm i`
7. Reload Brackets.


### Manual Installation

1. Download this extension using the ZIP button and unzip it.
2. Copy it in Brackets `/extensions/user` folder by selecting **Help > Show Extension Folder**.
3. Run `npm i` inside `node/` folder
3. Reload Brackets.


### Configuration

Go to **View > Brackets Gitlab** and configure your Gitlab account.