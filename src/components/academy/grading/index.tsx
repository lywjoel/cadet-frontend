import { NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'

import GradingWorkspaceContainer from '../../../containers/academy/grading/GradingWorkspaceContainer'
import { stringParamToInt } from '../../../utils/paramParseHelpers'
import { controlButton } from '../../commons'
import ContentDisplay from '../../commons/ContentDisplay'
import GradingNavLink from './GradingNavLink'
import { GradingOverview } from './gradingShape'
import { OwnProps as GradingWorkspaceProps } from './GradingWorkspace'

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[]
}

interface IGradingProps
  extends IDispatchProps,
    IStateProps,
    RouteComponentProps<IGradingWorkspaceParams> {}

export interface IGradingWorkspaceParams {
  submissionId?: string
  questionId?: string
}

export interface IDispatchProps {
  handleFetchGradingOverviews: () => void
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[]
}

class Grading extends React.Component<IGradingProps, State> {
  private gridApi?: GridApi
  private columnApi?: ColumnApi

  public constructor(props: IGradingProps) {
    super(props)

    this.state = {
      columnDefs: [
        { headerName: 'Assessment ID', field: 'assessmentId' },
        { headerName: 'Assessment Name', field: 'assessmentName' },
        { headerName: 'Assessment Category', field: 'assessmentCategory' },
        { headerName: 'Student Name', field: 'studentName' },
        { headerName: 'Auograder grade', field: 'initialGrade' },
        { headerName: 'Grade adjustment', field: 'gradeAdjustment' },
        { headerName: 'Current Grade', field: 'currentGrade' },
        { headerName: 'Maximum Grade', field: 'maxGrade' },
        { headerName: 'XP', field: 'initialXp' },
        { headerName: 'XP adjustment', field: 'xpAdjustment' },
        { headerName: 'Current XP', field: 'currentXp' },
        { headerName: 'Maximum XP', field: 'maxXp' },
        {
          headerName: 'Edit',
          field: '',
          cellRendererFramework: GradingNavLink
        }
      ]
    }
  }

  public render() {
    const submissionId: number | null = stringParamToInt(this.props.match.params.submissionId)
    // default questionId is 0 (the first question)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || 0

    /* Create a workspace to grade a submission. */
    if (submissionId !== null) {
      const props: GradingWorkspaceProps = {
        submissionId,
        questionId
      }
      return <GradingWorkspaceContainer {...props} />
    }

    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Grading"
        description="Fetching submissions..."
        visual={<Spinner large={true} />}
      />
    )
    const grid = (
      <div className="Grading">
        <div className="ag-grid-parent ag-theme-balham">
          <AgGridReact
            gridAutoHeight={true}
            enableColResize={true}
            enableSorting={true}
            enableFilter={true}
            columnDefs={this.state.columnDefs}
            onGridReady={this.onGridReady}
            rowData={this.props.gradingOverviews}
          />
        </div>
        <div className="ag-grid-export-button">
          {controlButton('Export to CSV', IconNames.EXPORT, this.exportCSV)}
        </div>
      </div>
    )
    return (
      <ContentDisplay
        loadContentDispatch={this.props.handleFetchGradingOverviews}
        display={this.props.gradingOverviews === undefined ? loadingDisplay : grid}
        fullWidth={true}
      />
    )
  }

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api
    this.columnApi = params.columnApi
    this.columnApi.autoSizeAllColumns()
  }

  private exportCSV = () => {
    if (this.gridApi === undefined) {
      return
    }
    this.gridApi.exportDataAsCsv()
  }
}

export default Grading
