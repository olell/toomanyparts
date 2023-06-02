from tomapa.models.parts import PartCategory


def _create_category_tree(tree, base_parent=None):
    for key in tree:
        el = tree[key]
        base_category = PartCategory.get_or_none(PartCategory.name == key)
        if base_category is None:
            base_category = PartCategory(name=key, parent=base_parent)
            base_category.save(1)
        else:
            base_category.parent = base_parent
            base_category.save()

        if type(el) == list:
            for sub in el:
                cat = PartCategory.get_or_none(PartCategory.name == sub)
                if cat is None:
                    cat = PartCategory(name=sub, parent=base_category)
                    cat.save(1)
                else:
                    cat.parent = base_category
                    cat.save()
        if type(el) == dict:
            _create_category_tree(el, base_parent=base_category)


def create_categories():
    # Populates this tree of categories into the database
    # (to create a category without more sub-categories use the value None)
    # (categories in list are created without sub-categories)
    # The list is based on ocotpart's categories
    _create_category_tree(
        {
            "Passive Components": {
                "Capacitors": [
                    "Aluminium Electrolytic Capacitors",
                    "Capacitor Arrays",
                    "Ceramic Capacitors",
                    "Film Capacitors",
                    "Mica Capacitors",
                    "Polymer Capacitors",
                    "Tantalum Capacitors",
                    "Trimmer / Variable Capacitors",
                ],
                "Crystals and Oscillators": [
                    "Crystals",
                    "Oscillators",
                    "Resonators",
                ],
                "EMI / RFI Components": [
                    "Common Mode Chokes",
                    "Ferrite Beads and Chips",
                ],
                "Inductors": [
                    "Fixed Inductors",
                    "Variable Inductors",
                ],
                "Resistors": [
                    "Chip SMD Resistors",
                    "Resistor Arrays",
                    "Thermistors",
                    "Through-Hole Resistors",
                    "Variable Resistors and Potentiometers",
                    "Wirewound Resistors",
                ],
                "Transformers": None,
            },
            "Integrated Circuits (ICs)": {
                "Clock and Timing": [
                    "Clock Buffers, Drivers",
                    "Clock Generators, PLLs, Frequency Synthesizers",
                    "Real Time Clocks",
                    "Timers and Oscillators",
                ],
                "Data Converter ICs": [
                    "Analog to Digital Converters (ADCs)",
                    "Digital Potentiometers",
                    "Digital to Analog Converters (DACs)",
                    "Touch Screen Controllers",
                ],
                "Embedded Processors and Controllers": [
                    "CPLDs - Complex Programming Logic Devices",
                    "DSPs - Digital Signal Processors",
                    "FPGAs - Field Programmable Gate Arrays",
                    "Microcontrollers",
                    "Microprocessors",
                    "Single Board Computers (SBCs)",
                ],
                "Interface ICs": [
                    "CODECs",
                    "Ethernet Interface ICs",
                    "RS-232 / RS-422 / RS-485 Interface ICs",
                    "UART Interface ICs",
                    "USB Interface ICs",
                ],
                "Linear ICs": [
                    "Amplifiers - Audio",
                    "Amplifiers - Op Amps, Buffer, Instrumentation",
                    "Comparators",
                ],
                "Logic ICs": [
                    "Buffers, Drivers and Transceivers",
                    "Counters",
                    "Decoders and Multiplexers",
                    "Latches and Flip Flops",
                    "Logic Gates",
                    "Shift Registers",
                    "Voltage Level Shifters",
                ],
                "Memory": [
                    "EEPROM",
                    "FIFO",
                    "Flash",
                    "RAM",
                ],
                "Power Management ICs": [
                    "Battery Management",
                    "Gate Drivers",
                    "Hot Swap Controllers",
                    "LED Drivers",
                    "Motor Drivers",
                    "Voltage References",
                    "Voltage Regulators - Linear",
                    "Voltage Regulators - Switching",
                    "Voltage Supervisors",
                ],
                "RF Semiconductors and Devices": [
                    "RF Amplifiers",
                    "RF Antennas",
                    "RF Mixers",
                    "RF Receivers, Transceivers",
                ],
            },
            "Discrete Semiconductors": {
                "Diodes": [
                    "Rectifier Diodes",
                    "Schottky Diodes",
                    "Zener Diodes",
                ],
                "Thyristors": [
                    "DIACs, SIDACs",
                    "SCRs",
                    "TRIACs",
                ],
                "Transistors": [
                    "BJTs",
                    "IGBTs",
                    "JFETs",
                    "MOSFETs",
                ],
            },
            "Electromechanical": {
                "Audio Products": [
                    "Buzzers",
                    "Microphones",
                    "Speakers",
                ],
                "Motors and Drives": [
                    "AC, DC and Servo Motors",
                    "Motor Drives",
                    "Stepper Motors",
                ],
                "Relays": [
                    "Power Relays",
                    "Signal Relays",
                    "Solid State Relays",
                    "Time Delay Relays",
                ],
                "Switches": [
                    "DIP Switches",
                    "Encoders",
                    "Keylock Switches",
                    "Pushbutton Switches",
                    "Rocker Switches",
                    "Rotary Switches",
                    "Slide Switches",
                    "Snap Action / Limit Switches",
                    "Switch Accessories",
                    "Tactile Switches",
                    "Toggle Switches",
                ],
                "Thermal Management": [
                    "Fans and Blowers",
                    "Heat Sinks",
                ],
            },
            "Connectors": [
                "Audio / Video Connectors",
                "Automotive Connectors",
                "Backplane Connectors",
                "Board to Board Connectors",
                "Card Edge Connectors",
                "Circular Connectors",
                "D-Sub Connectors",
                "FFC / FPC",
                "Fiber Optic Connectors",
                "Headers and Wire Housings",
                "IC and Component Sockets",
                "Memory Connectors",
                "Modular / Ethernet Connectors",
                "Photovoltaic / Solar Connectors",
                "Power Connectors",
                "RF / Coaxial Connectors",
                "Terminal Blocks",
                "Terminals",
                "USB Connectors",
            ],
            "Sensors": {
                "Current Sensors": None,
                "Flow Sensors": None,
                "Magnetic Sensors": None,
                "Motion Sensors": [
                    "Accelerometers",
                    "Gyroscopes",
                    "Inertial Measurement Units (IMUs)",
                ],
                "Optical Sensors": [
                    "Photodiodes",
                    "Photoelectric Sensors",
                    "Phototransistor",
                ],
                "Pressure Sensors": None,
                "Proximity Sensors": None,
                "Temperature and Humidity Sensors": None,
            },
            "Optoelectronics": {
                "Displays": [
                    "LCD, OLED, Graphic Displays",
                    "LED Displays",
                ],
                "Fiber Optics": None,
                "LEDs": None,
                "Lamps": None,
                "Laser Products": None,
                "Optocouplers": None,
            },
            "Circuit Protection": [
                "Circuit Breakers",
                "ESD and Circuit Protection ICs",
                "Fuse Holders",
                "Fuses",
                "PTC Resettable Fuses",
                "TVS Diodes",
                "Varistors",
            ],
            "Cables and Wire": {
                "Audio / Video Cables": None,
                "Bulk Hook-up Wire": None,
                "Bulk Multiple Conductor Cables": None,
                "Coaxial / RF Cable Assemblies": None,
                "D-Sub Cables": None,
                "Ethernet Cables": None,
                "FFC / FPC Cables": None,
                "Fiber Optic Cables": None,
                "Flat Ribbon Cables": None,
                "USB Cables": None,
                "Wire Protection and Management": [
                    "Cable Markers",
                    "Cable Ties",
                    "Heat Shrink Tubing",
                    "Non-Heat Shrink Tubing and Sleeves",
                    "Wire Ducting",
                ],
            },
        }
    )
