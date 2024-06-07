---
layout: example.11ty.js
title: Open Ecoacoustics | Examples | Validation Interface (fake)
---

## How to Create a Verification Grid

To use a verification grid, you will have to create a simple website.

To help, we have provided a template below that you can copy and modify.
Along with additional information on how to customize it to your needs.

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OE Bat Verification Grid</title>
    <script type="module" src="https://esm.run/@ecoacoustics/web-components"></script>
  </head>

  <body>
    <oe-verification-grid id="verification-grid" grid-size="3" selection-behavior="desktop">
      <template>
        <oe-axes>
          <oe-indicator>
            <oe-spectrogram id="spectrogram" color-map="audacity"></oe-spectrogram>
          </oe-indicator>
        </oe-axes>
        <oe-media-controls for="spectrogram"></oe-media-controls>
        <oe-info-card></oe-info-card>
      </template>

      <oe-decision verified="true" tag="koala" shortcut="Y">Grey-headed flying fox</oe-decision>
      <oe-decision verified="false" tag="koala" shortcut="N">Grey-headed flying fox</oe-decision>
    </oe-verification-grid>

    <oe-data-source for="verification-grid" local></oe-data-source>
  </body>
</html>
```

### Breakdown and Explanation

Most of the code that you see in the template above is boilerplate, and in most
circumstances, you should not need to modify it.

Some important code snippets that you can modify above:

#### Changing the Title Shown in the Browser Tab

You can change the text shown in the browser tab by modifying the `<title></title>` elements content.

For example: If you want to change the title of your verification component from _OE Bat Verification Grid_ to _Koala Verification Grid_, you would change the text in between the `<title>` code to the following.

```html
<title>Koala Verification Grid</title>
```

#### Changing the Decisions

You can change the

### How to Publish Your Verification Grid

So that other people can use your verification grid, you will need to publish the
code you wrote above to the public internet.

_Note: By publishing your website, any person (or machine) who has access to the
internet will be able to access your website._

Netlify is a website that publishes your websites to the internet and allows other
people to use your website (such as the verification grid created before).

```toml
# netlify.toml
[[headers]]
  for = "/*"
    [headers.values]
    Access-Control-Allow-Origin = "*"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

#### Publishing Your Verification Grid

To publish your website, simply drag and drop both the `index.html` and `netlify.toml`
files into [app.netlify.com/drop](https://app.netlify.com/drop).
