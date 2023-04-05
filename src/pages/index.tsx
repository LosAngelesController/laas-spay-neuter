import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, createRef } from "react";
import Slider from "rc-slider";
import { titleCase } from "title-case";

import { computeclosestcoordsfromevent } from "../components/getclosestcoordsfromevent";
import { CloseButton } from "../components/CloseButton";
import { signintrack, uploadMapboxTrack } from "../components/mapboxtrack";
import TooltipSlider, { handleRender } from "../components/TooltipSlider";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import Nav from "../components/nav";

import { MantineProvider, Checkbox } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";

import Icon from "@mdi/react";
import { mdiPlay } from "@mdi/js";
import { mdiPause, mdiSkipNext, mdiSkipPrevious } from "@mdi/js";

import CouncilDist from "./CouncilDistricts.json";
import { auth, signInWithGoogle, signOutOfApp } from "./../components/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const councildistricts = require("./CouncilDistricts.json");
const citybounds = require("./citybounds.json");
// @ts-ignore: Unreachable code error
import * as turf from "@turf/turf";
import { datadogRum } from "@datadog/browser-rum";

// added the following 6 lines.
import mapboxgl from "mapbox-gl";

import { assertDeclareExportAllDeclaration } from "@babel/types";

import { GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { Set } from "typescript";

const laasdatasource = require("./laas.json");

function isTouchScreen() {
  return window.matchMedia("(hover: none)").matches;
}

var cacheofcdsfromnames: any = {};

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

const filterableraces: any = {
  Discounted: 39,
  Free: 22,
  Shelter: 7,
};

const filterableraceskeys = Object.keys(filterableraces);

const Home: NextPage = () => {
  var councilBounds: any = {
    features: CouncilDist.features,
    type: "FeatureCollection",
  };

  const calculateifboxisvisible = () => {
    if (typeof window != "undefined") {
      return window.innerWidth > 640;
    } else {
      return true;
    }
  };

  const listofcouncildists = Array.from({ length: 15 }, (_, i) => i + 1).map(
    (eachItem) => String(eachItem)
  );

  const shouldfilteropeninit =
    typeof window != "undefined" ? window.innerWidth >= 640 : false;
  const [showtotalarea, setshowtotalarea] = useState(false);

  var mapref: any = useRef(null);
  const okaydeletepoints: any = useRef(null);

  const [doneloadingmap, setdoneloadingmap] = useState(false);

  const [selectedfilteropened, setselectedfilteropened] = useState("race");

  const [filteredraces, setfilteredraces] = useState<string[]>(
    Object.entries(filterableraces).map((eachrace) => eachrace[0])
  );

  const [filterpanelopened, setfilterpanelopened] =
    useState(shouldfilteropeninit);

  const [mapboxloaded, setmapboxloaded] = useState(false);

  const setfilteredracepre = (input: string[]) => {
    console.log("inputvalidator", input);
    if (input.length === 0) {
      setfilteredraces(["99999"]);
    } else {
      setfilteredraces(input);
    }
  };

  const [shelterselected, setshelterselected] = useState<any>(null);

  function turfify(polygon: any) {
    var turffedpolygon;

    console.log("polygon on line 100", polygon);

    if (polygon.geometry.type == "Polygon") {
      turffedpolygon = turf.polygon(polygon.geometry.coordinates);
    } else {
      turffedpolygon = turf.multiPolygon(polygon.geometry.coordinates);
    }

    return turffedpolygon;
  }

  function polygonInWhichCd(polygon: any) {
    if (typeof polygon.properties.name === "string") {
      if (cacheofcdsfromnames[polygon.properties.name]) {
        return cacheofcdsfromnames[polygon.properties.name];
      } else {
        var turffedpolygon = turfify(polygon);

        const answerToReturn = councildistricts.features.find(
          (eachItem: any) => {
            //turf sucks for not having type checking, bypasses compile error Property 'booleanIntersects' does not exist on type 'TurfStatic'.
            //yes it works!!!! it's just missing types
            // @ts-ignore: Unreachable code error
            return turf.booleanIntersects(turfify(eachItem), turffedpolygon);
          }
        );

        cacheofcdsfromnames[polygon.properties.name] = answerToReturn;

        return answerToReturn;
      }
    }
  }

  var [hasStartedControls, setHasStartedControls] = useState(false);

  useEffect(() => {
    let arrayoffilterables: any = [];

    arrayoffilterables.push([
      "match",
      ["get", "Race"],
      filteredraces.map((x) => String(x)),
      true,
      false,
    ]);

    if (mapref.current) {
      if (doneloadingmap) {
        const filterinput = JSON.parse(
          JSON.stringify(["all", ...arrayoffilterables])
        );

        console.log(filterinput);

        if (doneloadingmap === true) {
          mapref.current.setFilter("deathsheatmap", filterinput);
          mapref.current.setFilter("deathsdots", filterinput);
        }
      }
    }
  }, [filteredraces]);

  function checkHideOrShowTopRightGeocoder() {
    var toprightbox = document.querySelector(".mapboxgl-ctrl-top-right");
    if (toprightbox) {
      var toprightgeocoderbox: any = toprightbox.querySelector(
        ".mapboxgl-ctrl-geocoder"
      );
      if (toprightgeocoderbox) {
        if (typeof window != "undefined") {
          if (window.innerWidth >= 768) {
            console.log("changing to block");
            toprightgeocoderbox.style.display = "block";
          } else {
            toprightgeocoderbox.style.display = "none";
            console.log("hiding");
          }
        } else {
          toprightgeocoderbox.style.display = "none";
        }
      }
    }
  }

  const handleResize = () => {
    checkHideOrShowTopRightGeocoder();
  };

  const divRef: any = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("map div", divRef);

    if (divRef.current) {
      console.log("app render");
    }

    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXJ6dW1hbnlhbnYiLCJhIjoiY2xiemtydnB4M2xzMDNwcGxoN3NmbjVnNiJ9.3jfLzShbGXEwqiezliN8lQ";

    const formulaForZoom = () => {
      if (typeof window != "undefined") {
        if (window.innerWidth > 700) {
          return 10;
        } else {
          return 9.1;
        }
      }
    };

    const urlParams = new URLSearchParams(
      typeof window != "undefined" ? window.location.search : ""
    );
    const latParam = urlParams.get("lat");
    const lngParam = urlParams.get("lng");
    const zoomParam = urlParams.get("zoom");
    const debugParam = urlParams.get("debug");

    var mapparams: any = {
      container: divRef.current,
      style: "mapbox://styles/mapbox/dark-v11",

      center: [-118.41, 34],
      zoom: formulaForZoom(),
    };

    const map = new mapboxgl.Map(mapparams);
    mapref.current = map;

    var rtldone = false;

    try {
      if (rtldone === false && hasStartedControls === false) {
        setHasStartedControls(true);

        mapboxgl.setRTLTextPlugin(
          "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.10.1/mapbox-gl-rtl-text.js",
          (callbackinfo: any) => {
            console.log(callbackinfo);
            rtldone = true;
          }
        );
      }

      const language = new MapboxLanguage();
      map.addControl(language);
    } catch (error) {
      console.error(error);
    }

    window.addEventListener("resize", handleResize);

    map.on("load", () => {
      map.loadImage("./dog512.png", (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        if (image) {
          map.addImage("dog", image);
        }
        map.addSource("deathssource", {
          type: "geojson",
          data: laasdatasource,
        });

        map.addLayer({
          id: "deathslayer",
          type: "symbol",
          source: "deathssource",
          layout: {
            visibility: "visible",
            "icon-image": "dog",
            "icon-size": 0.1,
          },
        });

        map.setFilter("deathslayer", [
          "==",
          ["get", "Discounted/Free/Shelter"],
          "Shelter",
        ]);
        map.addLayer({
          id: "park-volcanoes",
          type: "heatmap",
          source: "deathssource",
          paint: {
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 255, 0)",
              0.1,
              "royalblue",
              0.3,
              "cyan",
              0.5,
              "lime",
              0.7,
              "yellow",
              1,
              "red",
            ],
            "heatmap-opacity": 1,
            "heatmap-radius": 10,
            "heatmap-weight": 1,
            "heatmap-intensity": 1,
          },
        });

        map.addLayer({
          id: "park-volcanoes",
          type: "circle",
          source: "deathssource",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              7,
              22,
              12,
              30,
              15,
            ],
            "circle-color": "hsl(60, 0%, 100%)",
            "circle-opacity": 0,
            "circle-stroke-width": 2,
            "circle-stroke-color": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              "hsl(0, 0%, 58%)",
              22,
              "hsl(0, 4%, 60%)",
            ],
            "circle-stroke-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11.46,
              0,
              13,
              0.17,
              15,
              1,
            ],
          },
          layout: {},
        });

        //create mousedown trigger
        map.on("mousedown", "park-volcanoes", (e) => {
          console.log("mousedown", e, e.features);
          if (e.features) {
            const closestcoords = computeclosestcoordsfromevent(e);

            const filteredfeatures = e.features.filter((feature: any) => {
              return (
                feature.geometry.coordinates[0] === closestcoords[0] &&
                feature.geometry.coordinates[1] === closestcoords[1]
              );
            });

            if (filteredfeatures.length > 0) {
            }
          }
        });

        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        map.on("mousemove", "park-volcanoes", (e) => {
          console.log("mousemove", e, e.features);

          if (e.features) {
            map.getCanvas().style.cursor = "pointer";
            const closestcoords: any = computeclosestcoordsfromevent(e);

            const uniquefeatures = new Map(); // Use a Map to store unique features by coordinates

            // Iterate over all features to find unique features at closestcoords
            e.features.forEach((feature: any) => {
              const coords = feature.geometry.coordinates;
              if (
                coords[0] === closestcoords[0] &&
                coords[1] === closestcoords[1]
              ) {
                uniquefeatures.set(coords.join(","), feature);
              }
            });

            const filteredfeatures = [...uniquefeatures.values()]; // Convert Map values back to an array

            // Copy coordinates array.
            const coordinates = closestcoords.slice();

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            if (filteredfeatures.length > 0) {
              if (filteredfeatures[0]) {
                if (filteredfeatures[0].properties) {
                  if (filteredfeatures[0].properties) {
                    console.log("filteredfeatures", filteredfeatures);

                    const allthelineitems = filteredfeatures.map(
                      (eachdeath) => {
                        if (eachdeath.properties) {

                          const allpropertiesnames = Object.keys(eachdeath.properties);

                          allpropertiesnames.forEach((eachpropertyname) => {
                            if (eachdeath.properties[eachpropertyname] === "N/A") {
                              eachdeath.properties[eachpropertyname] = "";
                            }
                          });

                          // Include only values that are not "N/A"
                          return `
                        <li class="leading-none my-1">
                          <div class="location">${
                            eachdeath.properties["Location"] || ""
                          }</div>
                          <div class="address">
                            ${eachdeath.properties.Address ? `<span>${eachdeath.properties.Address}</span><br>` : ""}
                            ${eachdeath.properties.City ? `<span>${eachdeath.properties.City}</span>, ` : ""}
                            ${eachdeath.properties.ZIP ? `<span>${eachdeath.properties.ZIP}</span>` : ""}
                          </div>
                          ${
                            eachdeath.properties["Phone Number"]
                              ? `<div class="phone">Phone: ${eachdeath.properties["Phone Number"]}</div>`
                              : ""
                          }
                          ${eachdeath.properties["Veterinarian"] ? `<div class="vet">Vet: ${eachdeath.properties["Veterinarian"]}</div>` : ""}
                          <div class="animals">
                            ${eachdeath.properties["Cat S/N"] ? `<span>Cat S/N: ${eachdeath.properties["Cat S/N"]}</span><br>` : ""}
                            ${eachdeath.properties["Dog S/N"] ? `<span>Dog S/N: ${eachdeath.properties["Dog S/N"]}</span><br>` : ""}
                            ${
                              eachdeath.properties["Rabbit S/N"]
                                ? `<span>Rabbit S/N: ${eachdeath.properties["Rabbit S/N"]}</span><br>`
                                : ""
                            }
                            ${
                              eachdeath.properties["Community Cat Program data"]
                                ? `<span>Community Cat Program: ${eachdeath.properties["Community Cat Program data"]}</span>`
                                : ""
                            }
                          </div>
                          ${
                            eachdeath.properties["Discounted/Free/Shelter"]
                              ? `<div class="discounted">Discounted/Free/Shelter: ${eachdeath.properties["Discounted/Free/Shelter"]}</div>`
                              : ""
                          }
                        </li>
                      `;
                        }
                      }
                    );

                    popup
                      .setLngLat(coordinates)
                      .setHTML(
                        ` <div>
               
               
                <ul class='list-disc leading-none'>${
                  allthelineitems.length <= 7
                    ? allthelineitems.join("")
                    : allthelineitems.splice(0, 7).join("")
                }</ul>
                
                ${
                  allthelineitems.length >= 7
                    ? `<p class="text-xs text-gray-300">Showing 10 of ${allthelineitems.length} deaths</p>`
                    : ""
                }
              </div><style>
              .mapboxgl-popup-content {
                background: #212121e0;
                color: #fdfdfd;
              }
    
              .flexcollate {
                row-gap: 0.5rem;
                display: flex;
                flex-direction: column;
              }
              </style>`
                      )
                      .addTo(map);
                  }
                }
              }
            }
          }
        });

        map.on("mouseleave", "park-volcanoes", () => {
          if (urlParams.get("stopmouseleave") === null) {
            map.getCanvas().style.cursor = "";
            popup.remove();
          }
        });

        setdoneloadingmap(true);
        setshowtotalarea(window.innerWidth > 640 ? true : false);

        okaydeletepoints.current = () => {
          try {
            var affordablepoint: any = map.getSource("selected-home-point");
            affordablepoint.setData(null);
          } catch (err) {
            console.error(err);
          }
        };

        const processgeocodereventresult = (eventmapbox: any) => {
          var singlePointSet: any = map.getSource("single-point");

          singlePointSet.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: eventmapbox.result.geometry,
              },
            ],
          });

          console.log("event.result.geometry", eventmapbox.result.geometry);
          console.log("geocoderesult", eventmapbox);
        };

        const processgeocodereventselect = (object: any) => {
          var coord = object.feature.geometry.coordinates;
          var singlePointSet: any = map.getSource("single-point");

          singlePointSet.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: object.feature.geometry,
              },
            ],
          });
        };

        const geocoder: any = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: map,
          proximity: {
            longitude: -118.41,
            latitude: 34,
          },
          marker: true,
        });

        var colormarker = new mapboxgl.Marker({
          color: "#41ffca",
        });

        const geocoderopt: any = {
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: {
            color: "#41ffca",
          },
        };

        const geocoder2 = new MapboxGeocoder(geocoderopt);
        const geocoder3 = new MapboxGeocoder(geocoderopt);

        geocoder.on("result", (event: any) => {
          processgeocodereventresult(event);
        });

        geocoder.on("select", function (object: any) {
          processgeocodereventselect(object);
        });

        var geocoderId = document.getElementById("geocoder");

        if (geocoderId) {
          console.log("geocoder div found");

          if (!document.querySelector(".geocoder input")) {
            geocoderId.appendChild(geocoder3.onAdd(map));

            var inputMobile = document.querySelector(".geocoder input");

            try {
              var loadboi = document.querySelector(
                ".mapboxgl-ctrl-geocoder--icon-loading"
              );
              if (loadboi) {
                var brightspin: any = loadboi.firstChild;
                if (brightspin) {
                  brightspin.setAttribute("style", "fill: #e2e8f0");
                }
                var darkspin: any = loadboi.lastChild;
                if (darkspin) {
                  darkspin.setAttribute("style", "fill: #94a3b8");
                }
              }
            } catch (err) {
              console.error(err);
            }

            if (inputMobile) {
              inputMobile.addEventListener("focus", () => {
                //make the box below go away
              });
            }
          }

          geocoder2.on("result", (event: any) => {
            processgeocodereventresult(event);
          });

          geocoder2.on("select", function (object: any) {
            processgeocodereventselect(object);
          });

          geocoder3.on("result", (event: any) => {
            processgeocodereventresult(event);
          });

          geocoder3.on("select", function (object: any) {
            processgeocodereventselect(object);
          });
        }

        map.addSource("single-point", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        if (true) {
          map.addLayer({
            id: "point",
            source: "single-point",
            type: "circle",
            paint: {
              "circle-radius": 10,
              "circle-color": "#41ffca",
            },
          });
        }

        if (debugParam) {
          map.showTileBoundaries = true;
          map.showCollisionBoxes = true;
          map.showPadding = true;
        }

        // if (urlParams.get("terraindebug")) {
        //   map.showTerrainWireframe = true;
        // }

        map.loadImage("/map-marker.png", (error, image: any) => {
          if (error) throw error;

          // Add the image to the map style.
          map.addImage("map-marker", image);
        });

        if (
          !document.querySelector(
            ".mapboxgl-ctrl-top-right > .mapboxgl-ctrl-geocoder"
          )
        ) {
          map.addControl(geocoder2);
        }

        checkHideOrShowTopRightGeocoder();

        if (true) {
          map.addLayer(
            {
              id: "citybound",
              type: "line",
              source: {
                type: "geojson",
                data: citybounds,
              },
              paint: {
                "line-color": "#dddddd",
                "line-opacity": 1,
                "line-width": 3,
              },
            },
            "waterway-label"
          );
        }

        if (hasStartedControls === false) {
          map.addControl(new mapboxgl.NavigationControl());

          map.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true,
              },

              trackUserLocation: true,

              showUserHeading: true,
            })
          );
        }

        checkHideOrShowTopRightGeocoder();

        var mapname = "beds";

        map.on("dragstart", (e) => {
          uploadMapboxTrack({
            mapname,
            eventtype: "dragstart",
            globallng: map.getCenter().lng,
            globallat: map.getCenter().lat,
            globalzoom: map.getZoom(),
          });
        });

        map.on("dragend", (e) => {
          uploadMapboxTrack({
            mapname,
            eventtype: "dragend",
            globallng: map.getCenter().lng,
            globallat: map.getCenter().lat,
            globalzoom: map.getZoom(),
          });
        });

        map.on("zoomstart", (e) => {
          uploadMapboxTrack({
            mapname,
            eventtype: "dragstart",
            globallng: map.getCenter().lng,
            globallat: map.getCenter().lat,
            globalzoom: map.getZoom(),
          });
        });

        map.on("zoomend", (e) => {
          uploadMapboxTrack({
            mapname,
            eventtype: "zoomend",
            globallng: map.getCenter().lng,
            globallat: map.getCenter().lat,
            globalzoom: map.getZoom(),
          });
        });
      });
      //end of load
    });

    var getmapboxlogo: any = document.querySelector(".mapboxgl-ctrl-logo");

    if (getmapboxlogo) {
      getmapboxlogo.remove();
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-screen absolute">
      <MantineProvider
        theme={{ colorScheme: "dark" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Head>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/cropped-favicon-1-32x32.png"
          />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/cropped-favicon-1-180x180.png"
          />

          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>LAAS Spay Neuter & Shelter | Map</title>
          <meta property="og:type" content="website" />
          <meta name="twitter:site" content="@lacontroller" />
          <meta name="twitter:creator" content="@lacontroller" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            key="twittertitle"
            content="LAAS Spay Neuter & Shelter | Map"
          ></meta>
          <meta
            name="twitter:description"
            key="twitterdesc"
            content="LAAS Spay Neuter & Shelter of 2023 in Los Angeles, Filtered by Discounted/Free/Shelter."
          ></meta>
          <meta
            name="twitter:image"
            key="twitterimg"
            content="https://firebasestorage.googleapis.com/v0/b/lacontroller-2b7de.appspot.com/o/laas_banner.png?alt=media&token=d9ef3cd0-ad10-4599-9641-4a0c935168e0"
          ></meta>
          <meta
            name="description"
            content="LAAS Spay Neuter & Shelter of 2023 in Los Angeles, Filtered by Discounted/Free/Shelter."
          />

          <meta
            property="og:url"
            content="https://spayneuter.lacontroller.io/"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="LAAS Spay Neuter & Shelter| Map" />
          <meta
            property="og:description"
            content="LAAS Spay Neuter & Shelter of 2023  in Los Angeles, Filtered by Race & Council District."
          />
          <meta
            property="og:image"
            content="https://firebasestorage.googleapis.com/v0/b/lacontroller-2b7de.appspot.com/o/laas_banner.png?alt=media&token=d9ef3cd0-ad10-4599-9641-4a0c935168e0"
          />
        </Head>

        <div className="flex-none">
          <Nav />
        </div>

        <div className="flex-initial h-content flex-col flex z-50">
          <div className="   max-h-screen flex-col flex z-5">
            <div
              className="absolute mt-[3em] md:mt-[3.7em] md:ml-3 top-0 z-5 titleBox  ml-2 text-base bold md:semi-bold break-words bg-[#212121]"
              style={{
                backgroundColor: "#212121",
                color: "#ffffff",
              }}
            >
              <strong className="">LAAS Spay Neuter & Shelter </strong>
            </div>

            <div
              className={`geocoder absolute mt-[2.7em] md:mt-[4.1em] ml-1 left-1 md:hidden xs:text-sm sm:text-base md:text-lg`}
              id="geocoder"
            ></div>
            <div className="w-content"></div>

            <div className="fixed mt-[6em] ml-2 sm:hidden flex flex-row">
              {filterpanelopened === false && (
                <button
                  onClick={() => {
                    setfilterpanelopened(true);
                  }}
                  className={` md:hidden mt-2 rounded-full px-3 pb-1.5 pt-0.5 text-sm bold md:text-base 
                  bg-gray-800 bg-opacity-80 text-white border-white border-2`}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                    viewBox="0 0 24 24"
                    className="inline align-middle mt-0.5"
                  >
                    <path
                      fill="currentColor"
                      d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
                    />
                  </svg>
                  <span>Filter</span>
                </button>
              )}
            </div>

            <div
              className="filterandinfobox  fixed
 top-auto bottom-0 left-0 right-0
   sm:max-w-sm sm:absolute sm:mt-[6em] md:mt-[3em] sm:ml-3 
  sm:top-auto sm:bottom-auto sm:left-auto 
  sm:right-auto flex flex-col gap-y-2"
            >
              {filterpanelopened === false && (
                <div className=" flex flex-row">
                  <button
                    onClick={() => {
                      setfilterpanelopened(true);
                    }}
                    className={`hidden md:block mt-2 rounded-full px-3 pb-1.5 pt-0.5 text-sm bold md:text-base 
                  bg-gray-800 bg-opacity-80 text-white border-white border-2`}
                  >
                    <svg
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      viewBox="0 0 24 24"
                      className="inline align-middle mt-0.5"
                    >
                      <path
                        fill="currentColor"
                        d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
                      />
                    </svg>
                    <span>Filter</span>
                  </button>
                </div>
              )}
              <div
                className={`
              ${
                filterpanelopened
                  ? "relative bg-zinc-900 w-content bg-opacity-90 px-2 py-1 mt-1 sm:rounded-lg"
                  : "hidden"
              }
              `}
              >
                <CloseButton
                  onClose={() => {
                    setfilterpanelopened(false);
                  }}
                />
                <div className="gap-x-0 flex flex-row w-full pr-8">
                  <button
                    onClick={() => {
                      setselectedfilteropened("race");
                    }}
                    className={`px-2 border-b-2 py-1  font-semibold ${
                      selectedfilteropened === "race"
                        ? "border-[#41ffca] text-[#41ffca]"
                        : "hover:border-white border-transparent text-gray-50"
                    }`}
                  >
                    Discounted/Free/Shelter
                  </button>
                </div>
                <div className="flex flex-col">
                  {selectedfilteropened === "race" && (
                    <div className="mt-2">
                      <div className="flex flex-row gap-x-1">
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1  border border-gray-400 text-sm md:text-base"
                          onClick={() => {
                            //  debugger;
                            setfilteredracepre(filterableraceskeys);

                            mapref.current.setFilter("park-volcanoes", [
                              "all",
                              [
                                "in",
                                "Discounted/Free/Shelter",
                                "Discounted",
                                "Free",
                                "Shelter",
                              ],
                            ]);
                            // mapref.current.setFilter('deathslayer', ['all', ["in", "Discounted/Free/Shelter",'Shelter'] ] );
                            // mapref.current.addLayer('deathslayer')
                            mapref.current.setLayoutProperty(
                              "deathslayer",
                              "visibility",
                              "visible"
                            );
                          }}
                        >
                          Select All
                        </button>
                        <button
                          className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base border border-gray-400"
                          onClick={() => {
                            setfilteredracepre([]);
                            mapref.current.setFilter("park-volcanoes", [
                              "==",
                              ["get", "Discounted/Free/Shelter"],
                              "ABC",
                            ]);
                            //  mapref.current.removeLayer('deathslayer')
                            mapref.current.setLayoutProperty(
                              "deathslayer",
                              "visibility",
                              "none"
                            );
                          }}
                        >
                          Unselect All
                        </button>
                      </div>
                      <div className="flex flex-row gap-x-1">
                        <div className="flex items-center">
                          <Checkbox.Group
                            value={filteredraces}
                            onChange={setfilteredracepre}
                          >
                            {" "}
                            <div
                              className={`grid grid-cols-3
                          } gap-x-4 `}
                            >
                              {Object.entries(filterableraces).map(
                                (eachEntry) => (
                                  <Checkbox
                                    id={eachEntry[0]}
                                    value={eachEntry[0]}
                                    label={
                                      <span className="text-nowrap text-xs">
                                        <span className="text-white">
                                          {titleCase(
                                            eachEntry[0].toLowerCase()
                                          ).replace(/latin/gi, "Latin")}
                                        </span>{" "}
                                        <span>{eachEntry[1]}</span>
                                      </span>
                                    }
                                    key={eachEntry[0]}
                                    onClick={(e) => {
                                      //  debugger
                                      const d = document.getElementById(
                                        "Discounted"
                                      ) as HTMLInputElement;
                                      const f = document.getElementById(
                                        "Free"
                                      ) as HTMLInputElement;
                                      const s = document.getElementById(
                                        "Shelter"
                                      ) as HTMLInputElement;

                                      console.log(s.checked);
                                      if (
                                        d.checked === true &&
                                        f.checked === true &&
                                        s.checked === true
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "visible"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Discounted",
                                              "Free",
                                              "Shelter",
                                            ],
                                          ]
                                        );
                                      } else if (
                                        d.checked === false &&
                                        f.checked === false &&
                                        s.checked === false
                                      ) {
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "==",
                                            ["get", "Discounted/Free/Shelter"],
                                            "ABC",
                                          ]
                                        );
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "none"
                                        );
                                      } else if (
                                        d.checked === false &&
                                        f.checked === true &&
                                        s.checked === true
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "visible"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Free",
                                              "Shelter",
                                            ],
                                          ]
                                        );
                                      } else if (
                                        d.checked === true &&
                                        f.checked === false &&
                                        s.checked === true
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "visible"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Discounted",
                                              "Shelter",
                                            ],
                                          ]
                                        );
                                      } else if (
                                        d.checked === true &&
                                        f.checked === true &&
                                        s.checked === false
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "none"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Discounted",
                                              "Free",
                                            ],
                                          ]
                                        );
                                      } else if (
                                        d.checked === false &&
                                        f.checked === false &&
                                        s.checked === true
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "visible"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Shelter",
                                            ],
                                          ]
                                        );
                                      } else if (
                                        d.checked === true &&
                                        f.checked === false &&
                                        s.checked === false
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "none"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Discounted",
                                            ],
                                          ]
                                        );
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "none"
                                        );
                                      } else if (
                                        d.checked === false &&
                                        f.checked === true &&
                                        s.checked === false
                                      ) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "none"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Free",
                                            ],
                                          ]
                                        );
                                      } else if (d.checked) {
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Discounted",
                                            ],
                                          ]
                                        );
                                      } else if (f.checked) {
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Free",
                                            ],
                                          ]
                                        );
                                      } else if (s.checked === true) {
                                        mapref.current.setLayoutProperty(
                                          "deathslayer",
                                          "visibility",
                                          "visible"
                                        );
                                        mapref.current.setFilter(
                                          "park-volcanoes",
                                          [
                                            "all",
                                            [
                                              "in",
                                              "Discounted/Free/Shelter",
                                              "Shelter",
                                            ],
                                          ]
                                        );
                                      }
                                    }}
                                  />
                                )
                              )}
                            </div>
                          </Checkbox.Group>
                        </div>{" "}
                      </div>{" "}
                      <p className="text-gray-200 text-xs">
                        Source:{" "}
                        <a
                          href="https://www.laanimalservices.com/spay-and-neuter"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          L.A. Animal Services | Spay and Neuter
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`text-sm ${
                  shelterselected != null
                    ? `px-3 pt-2 pb-3 
 bg-gray-900 sm:rounded-xl 
   bg-opacity-80 sm:bg-opacity-80 text-white 
   border-t-2  sm:border border-teal-500 sm:border-grey-500
   relative overflow-y-auto  scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-100 scrollbar-thumb-rounded
   `
                    : "hidden"
                }  ${
                  typeof window != "undefined"
                    ? `${
                        window.innerHeight < 1200 && window.innerWidth >= 500
                          ? "max-h-96"
                          : "max-h-[500px]"
                      }
                      
                      ${window.innerWidth < 500 ? "max-h-48 text-xs" : ""}
                      `
                    : ""
                }`}
              >
                <CloseButton
                  onClose={() => {
                    setshelterselected(null);

                    if (mapref.current) {
                      var affordablepoint: any = mapref.current.getSource(
                        "selected-shelter-point"
                      );
                      if (affordablepoint) {
                        affordablepoint.setData(null);

                        mapref.current.setLayoutProperty(
                          "points-selected-shelter-layer",
                          "visibility",
                          "visible"
                        );
                      }
                    } else {
                      console.log("no ref current");
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden">
          <span className="text-teal-200"></span>
          <span className="text-blue-200"></span>
          <span className="text-amber-200"></span>
          <span className="text-red-200"></span>
          <span className="text-purple-200 leading-none my-1"></span>

          <span className="text-pink-200"></span>
          <ul className="list-disc"></ul>
        </div>

        <div ref={divRef} style={{}} className="map-container w-full h-full " />

        {(typeof window !== "undefined" ? window.innerWidth >= 640 : false) && (
          <>
            <div
              className={`absolute md:mx-auto z-9 bottom-2 left-1 md:left-1/2 md:transform md:-translate-x-1/2`}
            >
              <a
                href="https://controller.lacity.gov/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://controller.lacity.gov/images/KennethMejia-logo-white-elect.png"
                  className="h-9 md:h-10 z-40"
                  alt="Kenneth Mejia LA City Controller Logo"
                />
              </a>
            </div>
          </>
        )}
      </MantineProvider>
    </div>
  );
};

export default Home;
