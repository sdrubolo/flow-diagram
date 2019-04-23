# flow-diagram package

This package is thought to allow people describe how entities interact between each other through [language-flow-diagram](https://atom.io/packages/language-flow-diagram) which was inspired by
[websequencediagrams](https://www.websequencediagrams.com/). Grammar definition is available at [language-flow-diagram](https://atom.io/packages/language-flow-diagram) page.

## Current Supported Platforms

- MacOS

Sorry, this is because I need to generate binary file for other platforms. It will come soon anyway.

## Grammar

CF grammar definition can be found below

![grammar](./grammar.png)

## Features

Currently the package offer

- **language-flow-diagram preview** : this functionality allows user to display the current diagram on a right side panel;
- **export** : user can export its diagram in the following formats : svg and pdf.

## Example

**Diagram preview**

After creating a \*.diagram file (diagram extension is mandatory); you can display its preview by selecting it from the menu, like the example below. The path is packages > flow-diagram > Diagram Preview

![how to display preview](./first.gif)


**Export to svg**

The flow-diagram package allows multiple export formats like svg.

![svg export](./export1.gif)


**Export to pdf**

The flow-diagram package also allows to export diagrams in pdf format

![pdf export](./export2.gif)

## What's next

What I really aim to publish is a tool to generate E2E tests basing on flow diagram documentation. In the next releases I would love to give Javascript E2E boilerplates code to allow a quick end to end test to be performed.
