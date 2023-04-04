import React from "react";
import {Badge, Button} from "flowbite-react";
import { useSnackbar } from "notistack";
import World from "../../../sounds/world.svg";
import {tableCellCommonClassnames} from "../TrainRow";
import {useTranslation} from "react-i18next";
import {TimeTableRow} from "../../index";
import { DetailedTrain } from "../../functions/trainDetails";
import {configByLoco} from "../../../config/trains";
import Tooltip from "rc-tooltip";
import classNames from "classnames";
import TimetableIcon from "../../../images/icons/png/timetable.png";
import ScheduleIcon from "../../../images/icons/png/schedule.png";
import { Link } from "react-router-dom";
import { ISteamUser } from "../../../config/ISteamUser";
import { differenceInMinutes } from "date-fns";
import { postConfig, StationConfig } from "../../../config/stations";

type Props = {
    ttRow: TimeTableRow;
    trainDetails: DetailedTrain;
    trainBadgeColor: string;
    setModalTrainId: (trainId: string | undefined) => void;
    setTimetableTrainId: (trainId: string | undefined) => void;
    firstColRef: any;
    distanceFromStation: number;
    trainHasPassedStation: boolean;
    isWebpSupported: boolean;
    streamMode: boolean;
    serverCode: string;
    players: ISteamUser[] | undefined;
    postCfg: StationConfig;
}
export const TrainInfoCell: React.FC<Props> = ({
       ttRow, trainDetails, trainBadgeColor,
       distanceFromStation, trainHasPassedStation,
       setModalTrainId, firstColRef, isWebpSupported,
       streamMode, setTimetableTrainId, serverCode, players, postCfg
}) => {
    const {t} = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const nextStation = trainDetails?.timetable?.find(entry => entry.indexOfPoint >= trainDetails?.TrainData?.VDDelayedTimetableIndex);
    const previousStation = trainDetails?.timetable?.map(e => e)?.reverse()?.find(entry => entry.indexOfPoint < trainDetails?.TrainData?.VDDelayedTimetableIndex);
    const nextStationName = nextStation?.nameForPerson || trainDetails?.closestStation;
    const ETADynamic = trainDetails?.TrainData?.Velocity ? (distanceFromStation / trainDetails.TrainData.Velocity) * 60 : undefined;
    const predictiveETA = Math.abs(differenceInMinutes(previousStation ? previousStation.scheduledDepartureObject : new Date(), ttRow.scheduledArrivalObject));
    const ETA = ETADynamic ? (predictiveETA < ETADynamic ? predictiveETA : ETADynamic) : predictiveETA;
    const controllingPlayer = players?.find(player => player.steamid === trainDetails?.TrainData?.ControlledBySteamID);
    const trainConfig = configByLoco[trainDetails?.Vehicles[0]];
    const trainIcon = isWebpSupported ? trainConfig?.iconWebp : trainConfig?.icon;
    const isTrainApproaching = !trainHasPassedStation && ((nextStationName === postCfg?.srId || postCfg.secondaryPosts?.some(post => postConfig[post]?.srId === nextStationName)) && distanceFromStation < 3);

    const CopyToClipboard = (stringToCopy: string) => {
        navigator.clipboard.writeText(stringToCopy);
        enqueueSnackbar(t('EDR_TRAINROW_copied'), { preventDuplicate: true, variant: 'success' });
    }

    return (
        <td className={tableCellCommonClassnames(streamMode)} ref={firstColRef}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Tooltip placement="top" overlay={<span>{t("EDR_TRAINROW_click_to_copy")}</span>}>
                        <Badge color={trainBadgeColor} size={streamMode ? "xs" : "sm"}>
                            <span className={classNames("!font-bold cursor-pointer", streamMode ? "text-base" : "text-lg")} onClick={() => CopyToClipboard(ttRow.trainNoLocal)}>
                                {ttRow.trainNoLocal}
                            </span>
                        </Badge>
                    </Tooltip>
                    { trainDetails && <span className="ml-1 flex">
                        <Tooltip placement="top" overlay={<span>{t("EDR_TRAINROW_show_on_map")}</span>}>
                            <Button size="xs" onClick={() => !!trainDetails && setModalTrainId(ttRow.trainNoLocal)}><img src={World} height={streamMode ? 8 : 16} width={streamMode ? 8 : 16} alt="Show on map"/></Button>
                        </Tooltip>
                        <Tooltip placement="top" overlay={<span>{t("EDR_TRAINROW_show_timetable")}</span>}>
                            <Button size="xs" className="ml-1" onClick={() => setTimetableTrainId(ttRow.trainNoLocal)}><img src={TimetableIcon} height={streamMode ? 8 : 16} width={streamMode ? 8 : 16} alt="Show timetable"/></Button>
                        </Tooltip>
                        <Tooltip placement="top" overlay={<span>{t("EDR_TRAINROW_switch_to_driver_view")}</span>}>
                            <Link to={`/${serverCode}/train/${ttRow.trainNoLocal}`}>
                                <Button size="xs" className="ml-1"><img src={ScheduleIcon} height={streamMode ? 8 : 16} width={streamMode ? 8 : 16} alt="Show timetable"/></Button>
                            </Link>
                        </Tooltip>
                    </span> }
                </div>
                <div className="flex md:inline">
                    <div className="flex justify-end">
                        {trainConfig?.icon && <span className="hidden lg:block"><img src={trainIcon} height={streamMode ? 30 : 40} width={streamMode ? 52 : 94} alt="train-icon"/></span>}
                    </div>
                    <div className="flex justify-end">
                        {
                            controllingPlayer?.personaname
                                ? <span className="flex items-center"><span className="hidden md:inline">{streamMode ? '' : controllingPlayer?.personaname}</span><img className="mx-2" width={16} src={controllingPlayer?.avatar} alt="avatar" /></span>
                                : <></>
                        }
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col md:flex-row">
                {  distanceFromStation
                    ? <div className="max-w-[70px] md:max-w-full max-h-[1.3rem] overflow-hidden"><span className="hidden md:inline">{t("EDR_TRAINROW_position_next")}:&nbsp;</span><span className={isTrainApproaching ? 'px-1 rounded bg-green-200 dark:bg-green-600 animate-pulse' : ''}>{nextStationName}</span>,&nbsp;<div className="inline-flex">{distanceFromStation}km</div></div>
                    : <>{t('EDR_TRAINROW_train_offline')}</>
                }
                &nbsp;
                {
                    distanceFromStation
                        ? trainHasPassedStation
                            ? <>({t("EDR_TRAINROW_train_away")})</>
                            : ETA && Math.round(ETA) <= 20 && distanceFromStation > 1
                                ? <>~ {Math.round(ETA)} {t("EDR_TRAINROW_train_minutes")}</>
                                : undefined
                        : undefined
                }
            </div>
        </td>
    )
}
