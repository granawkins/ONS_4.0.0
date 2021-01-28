export const ships = {
    SS1: {
        label: "Space Shuttle 1",
        location: "CAPE",
        volume: 75,
        flags: {
            renderCrew: true,
            renderLifeSupport: true,
            renderCargo: true,
            renderNavigation: true,
        },
        maxPropellant: {
            LO2: 6e8,
            LH2: 1e8,
            MMH: 2e6,
            N2O4: 3e6,
        },
        routes: {
            CAPE_LEO: {
                eta: 0.5, // Days
                label: "Low Earth Orbit",
                payload: 2.75e7,
                propellant: {
                    LO2: 6e8,
                    LH2: 1e8,
                }
            },
            CAPE_LEO_CAPE: {
                eta: 0.5, // Days
                label: "LEO - Return",
                payload: 1.4e7,
                propellant: {
                    LO2: 6e8,
                    LH2: 1e8,
                    MMH: 2e6,
                    N2O4: 3e6,
                }
            },
            LEO_CAPE: {
                eta: 0.5, // Days
                label: "Cape Canaveral, FL",
                payload: 1.4e7,
                propellant: {
                    MMH: 2e6,
                    N2O4: 3e6,
                },
            },
            LEO_GSO: {
                eta: 7,
                label: "Geostationary Orbit",
                payload: 2.3e6,
                propellant: {
                    MMH: 2e6,
                    N2O4: 3e6,
                },
            },
            GSO_LEO: {
                eta: 7,
                Label: "Low Earth Orbit",
                payload: 2.3e6,
                propellant: {
                    MMH: 2e6,
                    N2O4: 3e6,
                },
            },
          },
    },
    HLLV1: {
        label: "Heavy Lift 1",
        location: "CAPE",
        flags: {
            renderCargo: true,
            renderNavigation: true,
        },
        // In the study, HLLV uses the same main fuel tank, but
        // four Solid Rocket Boosters instead of Space Shuttle's 2.
        // It also only has a lightweight faring instead of a shuttle.
        //
        // Add 1% extra LO2 and LH2 for return trip
        maxPropellant: {
            LO2: 6.06e8,
            LH2: 1.01e8,
        },
        routes: {
            CAPE_LEO: {
                eta: 0.5, // Days
                label: "Low Earth Orbit",
                payload: 1.2e8,
                propellant: {
                    LO2: 6e8,
                    LH2: 1e8,
                }
            },
            CAPE_LEO_CAPE: {
                eta: 0.5, // Days
                label: "LEO - Return",
                payload: 6.0e7, // Same ratio as Space Shuttle
                propellant: {
                    LO2: 6.06e8,
                    LH2: 1.01e8,
                }
            },
            LEO_CAPE: {
                eta: 0.5, // Days
                label: "Cape Canaveral, FL",
                payload: 1.4e7,
                propellant: {
                    LO2: 6e6,
                    LH2: 1e6,
                },
            },
            LEO_GSO: {
                eta: 7,
                label: "Geostationary Orbit",
                payload: 1.02e7,
                propellant: {
                    LO2: 6e6,
                    LH2: 1e6,
                },
            },
            GSO_LEO: {
                eta: 7,
                Label: "Low Earth Orbit",
                payload: 2.3e6,
                propellant: {
                    LO2: 6e6,
                    LH2: 1e6,
                },
            },
        }
    }
}