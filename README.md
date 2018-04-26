# xpdf-functionapp

An Azure Function App to expose a number of Xpdf open source tools as web-services. 

Xpdf website: https://www.xpdfreader.com/index.html

## pdftotext

Original man page: https://www.xpdfreader.com/pdftotext-man.html

In this service we are attempting to convert a PDF file into plain text.

Requests must be submitted with `Content-Type: application/json`. There is one required property, `data`, which must contain a base64-encoded PDF file.

### Request example

| Request Property | Value |
| --- | --- |
| API Endpoint | `https://<your-app>.azurewebsites.net/api/pdftotext` |
| Supported Request Type | `POST` |
| Required Headers | `Content-Type: application/json` <br> `x-functions-key: <function auth key>`<sup>1</sup> |

**Example Body**
```
{
    "data": <base64-encoded PDF file>
}
```

There aren't currently any other supported properties for this endpoint. I may add the various pdftotext command-line switches described in the [man page](https://www.xpdfreader.com/pdftotext-man.html) at some point.

**Example Response**
```
{
"text": "The text contained within the PDF."
}
```

<sup>1</sup> see https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook#authorization-keys for details of how to use authorisation with HTTP triggers.

## Deployment

The easiest way to deploy these functions for yourselves will be to:
* setup a basic Azure Function App, but do not setup any functions
  * follow the "Log in to Azure" and "Create a function app" instructions here: https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function#create-a-function-app, but stop before "Create an HTTP triggered function"
* fork this repository to your own GitHub account
* follow the instructions at  https://docs.microsoft.com/en-us/azure/azure-functions/functions-continuous-deployment to setup continuous deployment from your fork, to the Function App

It is a *good* idea to have both a `master` and a `staging` branch and to setup both in separate Function Apps. This allows you to commit changes first to the `staging` branch and prove they work - I've come across the occasional inconsistency between local development and Azure's environment.