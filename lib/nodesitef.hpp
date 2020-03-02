#include <napi.h>
#include <string.h>
#include <dlfcn.h>
#include <iostream>

using Napi::Boolean;
using Napi::CallbackInfo;
using Napi::Env;
using Napi::Error;
using Napi::Function;
using Napi::Number;
using Napi::Object;
using Napi::String;
using Napi::TypeError;
using Napi::Value;

using std::string;

#ifndef NODESITEF_H // include guard
#define NODESITEF_H 1

#include "promises/promiseWorker.cpp"

// Tipos dos métodos do PinPad
typedef int (*VerificaPresencaPinPad)();
typedef int (*ConfiguraIntSiTefInterativo)(const char *, const char *, const char *, const char *);
typedef int (*IniciaFuncaoSiTefInterativo)(int, const char *, const char *, const char *, const char *, const char *, const char *);
typedef int (*ContinuaFuncaoSiTefInterativo)(int *, long *, int *, int *, const char *, int, int);
typedef void (*FinalizaFuncaoSiTefInterativo)(short, const char *, const char *, const char *, const char *);
typedef int (*EscreveMensagemPermanentePinPad)(const char *);
typedef int (*LeSimNaoPinPad)(const char *);

Value carregarDLL(const CallbackInfo &info);
Value continuaFuncaoSiTefInterativo(const CallbackInfo &info);

int verificaPresencaPinPad();
int configuraIntSiTefInterativo(const char *, const char *, const char *, const char *);
int escreveMensagemPermanentePinPad(const char *);
int leSimNaoPinPad(const char *);
int iniciaFuncaoSiTefInterativo(int, const char *, const char *, const char *, const char *, const char *, const char *);
void finalizaFuncaoSiTefInterativo(int confirma, const char *cupomFiscal, const char *dataFiscal, const char *horaFiscal, const char *paramAdicionais);

#endif /* NODESITEF_H */