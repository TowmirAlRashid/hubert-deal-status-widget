import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false);
  const [entity, setEntity] = useState(null);
  const [entityIds, setEntityIds] = useState(null);
  const [statusFieldOptions, setStatusFieldOptions] = useState(null);

  const [selectedStage, setSelectedStage] = useState(null);
  const [buttonClickedLoading, setButtonClickedLoading] = useState(false);

  useEffect(() => {
    // initialize the app
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setInitialized(true);
      setEntity(data?.Entity);
      setEntityIds(data?.EntityId);
      ZOHO.CRM.UI.Resize({ height: "40%", width: "5%" });
    });

    ZOHO.embeddedApp.init();
  }, []);

  useEffect(() => {
    if (initialized) {
      const fetchData = async () => {
        // get module status field details
        const fieldsResp = await ZOHO.CRM.META.getFields({ Entity: entity });
        fieldsResp?.fields?.forEach((field) => {
          if (field?.api_name === "Stage" || field?.api_name === "Status") {
            let pick_list_values = field?.pick_list_values?.map(
              (value) => value?.display_value
            );
            setStatusFieldOptions(pick_list_values);
          }
        });
      };

      fetchData();
    }
  }, [initialized, entity]);

  const handleSendUpdate = async () => {
    setButtonClickedLoading(true);
    let func_name = "towmir_widget_handle_send_update";
    let req_data = {
      arguments: JSON.stringify({
        entity: entity,
        entity_ids: entityIds,
        stage: selectedStage,
      }),
    };
    const functionResp = await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data);
    if (functionResp?.details?.output === "SUCCESS") {
      ZOHO.CRM.UI.Popup.closeReload();
      setButtonClickedLoading(false);
    }
  };

  if (statusFieldOptions) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "90%", mx: "auto" }}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "1.4rem",
              fontWeight: "bold",
              mt: 3,
              mb: 10,
            }}
          >
            Change Stage for Selected Deals
          </Typography>

          <Autocomplete
            disablePortal
            options={statusFieldOptions}
            fullWidth
            size="small"
            renderInput={(params) => <TextField {...params} label="Stage" />}
            onChange={(event, value) => {
              if (value) {
                setSelectedStage(value);
              } else {
                setSelectedStage(null);
              }
            }}
            sx={{ mb: 10 }}
          />

          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button
              size="small"
              variant="contained"
              disabled={!selectedStage || buttonClickedLoading}
              onClick={() => handleSendUpdate()}
            >
              Change Status
            </Button>
          </Box>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
            margin: "30% 0",
          }}
        >
          <CircularProgress color="inherit" />
          <Typography fontWeight="bold" fontSize="1.5rem">
            Fetching Data. Please Wait...
          </Typography>
        </Box>
      </Box>
    );
  }
}

export default App;
