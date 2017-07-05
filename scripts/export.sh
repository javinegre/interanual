#!/usr/bin/env bash

DATABASE=interanual
COLLECTION=historical
FIELDS=periodo,total,hombres,mujeres,hombresMenor25,mujeresMenor25,totalMenor25,hombresMayor25,mujeresMayor25,totalMayor25,agricultura,industria,construccion,servicios,sinEmpleo,andalucia,aragon,asturias,balears,canarias,cantabria,castillaMancha,castillaLeon,catalunya,comValenciana,extremadura,galicia,madrid,murcia,navarra,paisVasco,rioja,ceuta,melilla,ts
OFILE=./src/static/data/interanual.csv

mongoexport -d $DATABASE -c $COLLECTION --type=csv -f $FIELDS -q '{}' --sort '{ts: -1}' > $OFILE
